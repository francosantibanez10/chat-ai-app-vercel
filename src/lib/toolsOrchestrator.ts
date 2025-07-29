import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}

export interface ToolCall {
  tool: string;
  parameters: any;
  result?: any;
  error?: string;
}

export interface OrchestratorResponse {
  content: string;
  toolCalls: ToolCall[];
  usedTools: string[];
}

export class ToolsOrchestrator {
  private static instance: ToolsOrchestrator;
  private tools: Map<string, Tool> = new Map();
  
  private constructor() {
    this.registerDefaultTools();
  }
  
  static getInstance(): ToolsOrchestrator {
    if (!ToolsOrchestrator.instance) {
      ToolsOrchestrator.instance = new ToolsOrchestrator();
    }
    return ToolsOrchestrator.instance;
  }

  /**
   * Registra una nueva herramienta
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Obtiene todas las herramientas disponibles
   */
  getAvailableTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Procesa una consulta y determina qué herramientas usar
   */
  async processQuery(
    userQuery: string,
    conversationContext: any[],
    userPlan: string
  ): Promise<OrchestratorResponse> {
    // Determinar qué herramientas son relevantes
    const relevantTools = await this.determineRelevantTools(userQuery, userPlan);
    
    if (relevantTools.length === 0) {
      // No se necesitan herramientas, responder directamente
      return {
        content: await this.generateDirectResponse(userQuery, conversationContext),
        toolCalls: [],
        usedTools: []
      };
    }

    // Generar llamadas a herramientas
    const toolCalls = await this.generateToolCalls(userQuery, relevantTools, conversationContext);
    
    // Ejecutar las herramientas
    const executedCalls = await this.executeToolCalls(toolCalls);
    
    // Generar respuesta final usando los resultados
    const finalResponse = await this.generateResponseWithTools(
      userQuery,
      conversationContext,
      executedCalls
    );

    return {
      content: finalResponse,
      toolCalls: executedCalls,
      usedTools: relevantTools.map(t => t.name)
    };
  }

  /**
   * Determina qué herramientas son relevantes para la consulta
   */
  private async determineRelevantTools(userQuery: string, userPlan: string): Promise<Tool[]> {
    const availableTools = this.getAvailableTools();
    
    // Filtrar por plan del usuario
    const allowedTools = availableTools.filter(tool => {
      if (userPlan === 'free') {
        return ['web_search', 'calculator'].includes(tool.name);
      } else if (userPlan === 'plus') {
        return ['web_search', 'calculator', 'file_generator', 'image_analyzer'].includes(tool.name);
      } else {
        return true; // Pro plan tiene acceso a todas las herramientas
      }
    });

    if (allowedTools.length === 0) return [];

    const toolSelectionPrompt = `
Analiza la siguiente consulta del usuario y determina qué herramientas son relevantes:

Consulta: "${userQuery}"

Herramientas disponibles:
${allowedTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

Responde solo con un JSON que contenga los nombres de las herramientas relevantes:
{
  "relevantTools": ["tool1", "tool2"]
}

Si ninguna herramienta es necesaria, responde con un array vacío.`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: toolSelectionPrompt }],
        temperature: 0.1,
        maxTokens: 200
      });

      const textResult = await this.getTextSafely(result);
      
      // Verificar si el resultado es un error
      if (textResult.startsWith("Error:")) {
        return [];
      }

      const response = JSON.parse(textResult);
      const relevantToolNames = response.relevantTools || [];
      
      return allowedTools.filter(tool => relevantToolNames.includes(tool.name));
    } catch (error) {
      console.error("Error determining relevant tools:", error);
      return [];
    }
  }

  /**
   * Genera llamadas específicas a las herramientas
   */
  private async generateToolCalls(
    userQuery: string,
    tools: Tool[],
    conversationContext: any[]
  ): Promise<ToolCall[]> {
    const toolCalls: ToolCall[] = [];

    for (const tool of tools) {
      const callPrompt = `
Genera los parámetros para llamar a la herramienta "${tool.name}":

Descripción de la herramienta: ${tool.description}
Parámetros requeridos: ${tool.parameters.required.join(', ')}
Parámetros disponibles: ${Object.keys(tool.parameters.properties).join(', ')}

Consulta del usuario: "${userQuery}"
Contexto de la conversación: ${conversationContext.map(m => m.content).join(' | ')}

Genera los parámetros en formato JSON:
{
  "param1": "valor1",
  "param2": "valor2"
}`;

      try {
        const result = await streamText({
          model: openai("gpt-4o"),
          messages: [{ role: "user", content: callPrompt }],
          temperature: 0.1,
          maxTokens: 300
        });

        const parameters = JSON.parse(await this.getTextSafely(result));
        
        toolCalls.push({
          tool: tool.name,
          parameters
        });
      } catch (error) {
        console.error(`Error generating parameters for tool ${tool.name}:`, error);
        toolCalls.push({
          tool: tool.name,
          parameters: {},
          error: "Error generating parameters"
        });
      }
    }

    return toolCalls;
  }

  /**
   * Ejecuta las llamadas a herramientas
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolCall[]> {
    const executedCalls: ToolCall[] = [];

    for (const call of toolCalls) {
      try {
        const tool = this.tools.get(call.tool);
        if (!tool) {
          call.error = "Tool not found";
          executedCalls.push(call);
          continue;
        }

        const result = await tool.execute(call.parameters);
        call.result = result;
        executedCalls.push(call);
      } catch (error) {
        call.error = error instanceof Error ? error.message : "Unknown error";
        executedCalls.push(call);
      }
    }

    return executedCalls;
  }

  /**
   * Genera respuesta final usando los resultados de las herramientas
   */
  private async generateResponseWithTools(
    userQuery: string,
    conversationContext: any[],
    toolCalls: ToolCall[]
  ): Promise<string> {
    const successfulCalls = toolCalls.filter(call => call.result && !call.error);
    
    if (successfulCalls.length === 0) {
      return await this.generateDirectResponse(userQuery, conversationContext);
    }

    const responsePrompt = `
Genera una respuesta completa para el usuario basándote en los resultados de las herramientas utilizadas:

Consulta del usuario: "${userQuery}"

Resultados de las herramientas:
${successfulCalls.map(call => `
${call.tool}:
${JSON.stringify(call.result, null, 2)}
`).join('\n')}

Contexto de la conversación:
${conversationContext.map(m => `${m.role}: ${m.content}`).join('\n')}

Genera una respuesta coherente que:
1. Aborde directamente la consulta del usuario
2. Utilice la información obtenida de las herramientas
3. Sea clara y bien estructurada
4. Mantenga el contexto de la conversación`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: responsePrompt }],
        temperature: 0.7,
        maxTokens: 2000
      });

      return await this.getTextSafely(result);
    } catch (error) {
      console.error("Error generating response with tools:", error);
      return await this.generateDirectResponse(userQuery, conversationContext);
    }
  }

  /**
   * Genera respuesta directa sin herramientas
   */
  private async generateDirectResponse(
    userQuery: string,
    conversationContext: any[]
  ): Promise<string> {
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [
        ...conversationContext,
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      maxTokens: 2000
    });

    return await this.getTextSafely(result);
  }

  /**
   * Helper function para obtener texto de manera segura
   */
  private async getTextSafely(result: any): Promise<string> {
    try {
      if (typeof result === 'string') {
        return result;
      }
      if (result && typeof result.text === 'function') {
        return await result.text();
      }
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      console.error("Error getting text safely:", error);
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Registra herramientas por defecto
   */
  private registerDefaultTools(): void {
    // Herramienta de búsqueda web
    this.registerTool({
      name: "web_search",
      description: "Busca información actualizada en la web",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda"
          },
          max_results: {
            type: "number",
            description: "Número máximo de resultados",
            default: 5
          }
        },
        required: ["query"]
      },
      execute: async (params) => {
        // Simulación de búsqueda web
        return {
          results: [
            {
              title: `Resultado para: ${params.query}`,
              snippet: `Información simulada sobre ${params.query}`,
              url: `https://example.com/search?q=${encodeURIComponent(params.query)}`
            }
          ],
          total_results: 1
        };
      }
    });

    // Calculadora
    this.registerTool({
      name: "calculator",
      description: "Realiza cálculos matemáticos",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Expresión matemática a evaluar"
          }
        },
        required: ["expression"]
      },
      execute: async (params) => {
        try {
          // Evaluación segura de expresiones matemáticas
          const sanitizedExpression = params.expression.replace(/[^0-9+\-*/().]/g, '');
          const result = eval(sanitizedExpression);
          return {
            expression: params.expression,
            result: result,
            sanitized_expression: sanitizedExpression
          };
        } catch (error) {
          throw new Error("Expresión matemática inválida");
        }
      }
    });

    // Generador de archivos
    this.registerTool({
      name: "file_generator",
      description: "Genera archivos de diferentes tipos",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Tipo de archivo (pdf, excel, txt, json)",
            enum: ["pdf", "excel", "txt", "json"]
          },
          content: {
            type: "string",
            description: "Contenido del archivo"
          },
          filename: {
            type: "string",
            description: "Nombre del archivo"
          }
        },
        required: ["type", "content"]
      },
      execute: async (params) => {
        // Simulación de generación de archivos
        return {
          file_type: params.type,
          filename: params.filename || `generated_file.${params.type}`,
          content_length: params.content.length,
          status: "generated"
        };
      }
    });

    // Analizador de imágenes
    this.registerTool({
      name: "image_analyzer",
      description: "Analiza contenido de imágenes",
      parameters: {
        type: "object",
        properties: {
          image_url: {
            type: "string",
            description: "URL de la imagen a analizar"
          },
          analysis_type: {
            type: "string",
            description: "Tipo de análisis",
            enum: ["general", "objects", "text", "faces"],
            default: "general"
          }
        },
        required: ["image_url"]
      },
      execute: async (params) => {
        // Simulación de análisis de imagen
        return {
          image_url: params.image_url,
          analysis_type: params.analysis_type,
          description: "Descripción simulada de la imagen",
          objects_detected: ["objeto1", "objeto2"],
          confidence: 0.95
        };
      }
    });
  }

  /**
   * Obtiene estadísticas de uso de herramientas
   */
  getToolUsageStats(): {
    totalTools: number;
    toolNames: string[];
    usageCount: Record<string, number>;
  } {
    const toolNames = Array.from(this.tools.keys());
    const usageCount: Record<string, number> = {};
    
    toolNames.forEach(name => {
      usageCount[name] = 0; // Por ahora, implementar contador real
    });

    return {
      totalTools: toolNames.length,
      toolNames,
      usageCount
    };
  }
}

export const toolsOrchestrator = ToolsOrchestrator.getInstance(); 
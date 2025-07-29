import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  isEnabled: boolean;
  isExternal: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  functions: PluginFunction[];
  metadata: Record<string, any>;
  lastUsed?: Date;
  usageCount: number;
  successRate: number;
}

export interface PluginFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any, context?: any) => Promise<any>;
}

export interface PluginDiscovery {
  pluginId: string;
  confidence: number;
  reasoning: string;
  suggestedParams: Record<string, any>;
}

export interface PluginExecutionResult {
  pluginId: string;
  functionName: string;
  result: any;
  executionTime: number;
  success: boolean;
  error?: string;
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();
  private pluginRegistry: Map<string, Plugin> = new Map();
  private executionHistory: PluginExecutionResult[] = [];
  
  private constructor() {
    this.initializeDefaultPlugins();
  }
  
  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Inicializar plugins por defecto
   */
  private initializeDefaultPlugins(): void {
    // Plugin de búsqueda web
    this.registerPlugin({
      id: "web_search",
      name: "Búsqueda Web",
      description: "Busca información actualizada en la web",
      version: "1.0.0",
      author: "System",
      category: "search",
      tags: ["web", "search", "information"],
      isEnabled: true,
      isExternal: false,
      functions: [
        {
          name: "search",
          description: "Realiza una búsqueda web",
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
        }
      ],
      metadata: {},
      usageCount: 0,
      successRate: 0.9
    });

    // Plugin de análisis de datos
    this.registerPlugin({
      id: "data_analyzer",
      name: "Analizador de Datos",
      description: "Analiza y visualiza datos",
      version: "1.0.0",
      author: "System",
      category: "analysis",
      tags: ["data", "analysis", "visualization"],
      isEnabled: true,
      isExternal: false,
      functions: [
        {
          name: "analyze_csv",
          description: "Analiza datos CSV",
          parameters: {
            type: "object",
            properties: {
              data: {
                type: "string",
                description: "Datos CSV"
              },
              analysis_type: {
                type: "string",
                description: "Tipo de análisis",
                enum: ["summary", "trends", "correlations"]
              }
            },
            required: ["data"]
          },
          execute: async (params) => {
            // Simulación de análisis de datos
            return {
              summary: "Análisis de datos completado",
              insights: ["Insight 1", "Insight 2"],
              recommendations: ["Recomendación 1"]
            };
          }
        }
      ],
      metadata: {},
      usageCount: 0,
      successRate: 0.85
    });

    // Plugin de integración con APIs externas
    this.registerPlugin({
      id: "external_api",
      name: "APIs Externas",
      description: "Conecta con APIs externas",
      version: "1.0.0",
      author: "System",
      category: "integration",
      tags: ["api", "external", "integration"],
      isEnabled: true,
      isExternal: true,
      apiEndpoint: "https://api.example.com",
      functions: [
        {
          name: "call_api",
          description: "Llama a una API externa",
          parameters: {
            type: "object",
            properties: {
              endpoint: {
                type: "string",
                description: "Endpoint de la API"
              },
              method: {
                type: "string",
                description: "Método HTTP",
                enum: ["GET", "POST", "PUT", "DELETE"]
              },
              data: {
                type: "object",
                description: "Datos a enviar"
              }
            },
            required: ["endpoint", "method"]
          },
          execute: async (params) => {
            // Simulación de llamada a API
            return {
              status: "success",
              data: { message: "API call simulated" },
              timestamp: new Date().toISOString()
            };
          }
        }
      ],
      metadata: {},
      usageCount: 0,
      successRate: 0.8
    });
  }

  /**
   * Registrar un nuevo plugin
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
    this.pluginRegistry.set(plugin.id, plugin);
    console.log(`Plugin registrado: ${plugin.name} (${plugin.id})`);
  }

  /**
   * Helper function para obtener texto de manera segura
   */
  private async getTextSafely(result: any): Promise<string> {
    if (typeof result === 'string') {
      return result;
    }
    if (result && typeof result.text === 'function') {
      return await result.text();
    }
    return "Error: No se pudo obtener el texto.";
  }

  /**
   * Autodescubrimiento de plugins relevantes
   */
  async discoverRelevantPlugins(
    userQuery: string,
    context: any[] = []
  ): Promise<PluginDiscovery[]> {
    const availablePlugins = Array.from(this.plugins.values())
      .filter(p => p.isEnabled);

    const discoveryPrompt = `
Analiza la consulta del usuario y determina qué plugins serían útiles:

Consulta: "${userQuery}"
Contexto: ${context.map(m => m.content).join(' | ')}

Plugins disponibles:
${availablePlugins.map(p => `- ${p.name} (${p.id}): ${p.description}`).join('\n')}

Para cada plugin relevante, proporciona:
1. Confianza (0-1) de que es útil
2. Razonamiento
3. Parámetros sugeridos

Responde con JSON:
{
  "discoveries": [
    {
      "pluginId": "plugin_id",
      "confidence": 0.8,
      "reasoning": "por qué es útil",
      "suggestedParams": {"param1": "value1"}
    }
  ]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: discoveryPrompt }],
        temperature: 0.1,
        maxTokens: 500
      });

      const textResult = await this.getTextSafely(result);
      
      // Verificar si el resultado es un error
      if (textResult.startsWith("Error:")) {
        return [];
      }

      const response = JSON.parse(textResult);
      return response.discoveries || [];
    } catch (error) {
      console.error("Error discovering plugins:", error);
      return [];
    }
  }

  /**
   * Ejecutar plugin
   */
  async executePlugin(
    pluginId: string,
    functionName: string,
    parameters: any,
    context?: any
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return {
        pluginId,
        functionName,
        result: null,
        executionTime: Date.now() - startTime,
        success: false,
        error: "Plugin no encontrado"
      };
    }

    const pluginFunction = plugin.functions.find(f => f.name === functionName);
    if (!pluginFunction) {
      return {
        pluginId,
        functionName,
        result: null,
        executionTime: Date.now() - startTime,
        success: false,
        error: "Función no encontrada"
      };
    }

    try {
      const result = await pluginFunction.execute(parameters, context);
      
      // Actualizar estadísticas del plugin
      plugin.usageCount++;
      plugin.lastUsed = new Date();
      
      const executionResult: PluginExecutionResult = {
        pluginId,
        functionName,
        result,
        executionTime: Date.now() - startTime,
        success: true
      };

      this.executionHistory.push(executionResult);
      return executionResult;
    } catch (error) {
      const executionResult: PluginExecutionResult = {
        pluginId,
        functionName,
        result: null,
        executionTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      };

      this.executionHistory.push(executionResult);
      return executionResult;
    }
  }

  /**
   * Ejecutar múltiples plugins en paralelo
   */
  async executeMultiplePlugins(
    discoveries: PluginDiscovery[],
    context?: any
  ): Promise<PluginExecutionResult[]> {
    const executions = discoveries
      .filter(d => d.confidence > 0.5)
      .map(d => this.executePlugin(
        d.pluginId,
        Object.keys(d.suggestedParams)[0] || "default",
        d.suggestedParams,
        context
      ));

    return Promise.all(executions);
  }

  /**
   * Cargar plugin desde URL externa
   */
  async loadExternalPlugin(pluginUrl: string): Promise<Plugin | null> {
    try {
      const response = await fetch(pluginUrl);
      const pluginData = await response.json();
      
      // Validar estructura del plugin
      if (!pluginData.id || !pluginData.name || !pluginData.functions) {
        throw new Error("Estructura de plugin inválida");
      }

      const plugin: Plugin = {
        ...pluginData,
        isEnabled: true,
        isExternal: true,
        usageCount: 0,
        successRate: 0.8
      };

      this.registerPlugin(plugin);
      return plugin;
    } catch (error) {
      console.error("Error loading external plugin:", error);
      return null;
    }
  }

  /**
   * Obtener plugins por categoría
   */
  getPluginsByCategory(category: string): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.category === category && p.isEnabled);
  }

  /**
   * Obtener plugins más usados
   */
  getMostUsedPlugins(limit: number = 10): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.isEnabled)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Obtener plugins más exitosos
   */
  getMostSuccessfulPlugins(limit: number = 10): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.isEnabled && p.usageCount > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  /**
   * Obtener historial de ejecuciones
   */
  getExecutionHistory(limit: number = 50): PluginExecutionResult[] {
    return this.executionHistory
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Obtener estadísticas de plugins
   */
  getPluginStats(): {
    totalPlugins: number;
    enabledPlugins: number;
    externalPlugins: number;
    totalExecutions: number;
    averageSuccessRate: number;
    mostUsedPlugin: string;
  } {
    const plugins = Array.from(this.plugins.values());
    const totalPlugins = plugins.length;
    const enabledPlugins = plugins.filter(p => p.isEnabled).length;
    const externalPlugins = plugins.filter(p => p.isExternal).length;
    const totalExecutions = plugins.reduce((sum, p) => sum + p.usageCount, 0);
    const averageSuccessRate = plugins.length > 0 
      ? plugins.reduce((sum, p) => sum + p.successRate, 0) / plugins.length 
      : 0;
    const mostUsedPlugin = plugins
      .sort((a, b) => b.usageCount - a.usageCount)[0]?.name || 'N/A';

    return {
      totalPlugins,
      enabledPlugins,
      externalPlugins,
      totalExecutions,
      averageSuccessRate,
      mostUsedPlugin
    };
  }

  /**
   * Habilitar/deshabilitar plugin
   */
  togglePlugin(pluginId: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.isEnabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Eliminar plugin
   */
  removePlugin(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  /**
   * Limpiar historial antiguo
   */
  cleanupOldHistory(maxAgeDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    this.executionHistory = this.executionHistory.filter(execution => {
      // Asumir que las ejecuciones recientes están al final
      return true; // Por ahora, mantener todo el historial
    });
  }
}

export const pluginManager = PluginManager.getInstance(); 
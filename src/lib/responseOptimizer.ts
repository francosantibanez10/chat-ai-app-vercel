import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export interface ResponseQuality {
  relevance: number; // 0-1
  completeness: number; // 0-1
  clarity: number; // 0-1
  helpfulness: number; // 0-1
  toxicity: number; // 0-1 (lower is better)
  overall: number; // 0-1
}

export interface OptimizedResponse {
  content: string;
  quality: ResponseQuality;
  wasOptimized: boolean;
  originalResponse?: string;
}

export class ResponseOptimizer {
  private static instance: ResponseOptimizer;
  
  private constructor() {}
  
  static getInstance(): ResponseOptimizer {
    if (!ResponseOptimizer.instance) {
      ResponseOptimizer.instance = new ResponseOptimizer();
    }
    return ResponseOptimizer.instance;
  }

  /**
   * Genera múltiples respuestas y selecciona la mejor
   */
  async generateOptimizedResponse(
    messages: any[],
    userContext: any,
    maxAttempts: number = 3
  ): Promise<OptimizedResponse> {
    const responses: { content: string; quality: ResponseQuality }[] = [];

    // Generar múltiples respuestas
    for (let i = 0; i < maxAttempts; i++) {
      const response = await this.generateSingleResponse(messages, userContext, i);
      const quality = await this.evaluateResponseQuality(response, messages, userContext);
      responses.push({ content: response, quality });
    }

    // Seleccionar la mejor respuesta
    const bestResponse = responses.reduce((best, current) => 
      current.quality.overall > best.quality.overall ? current : best
    );

    // Si la calidad es baja, intentar autocorregir
    if (bestResponse.quality.overall < 0.7) {
      const correctedResponse = await this.autoCorrectResponse(
        bestResponse.content,
        messages,
        userContext
      );
      
      if (correctedResponse) {
        const correctedQuality = await this.evaluateResponseQuality(
          correctedResponse,
          messages,
          userContext
        );
        
        if (correctedQuality.overall > bestResponse.quality.overall) {
          return {
            content: correctedResponse,
            quality: correctedQuality,
            wasOptimized: true,
            originalResponse: bestResponse.content
          };
        }
      }
    }

    return {
      content: bestResponse.content,
      quality: bestResponse.quality,
      wasOptimized: false
    };
  }

  private async generateSingleResponse(
    messages: any[],
    userContext: any,
    attempt: number
  ): Promise<string> {
    const systemPrompt = this.buildOptimizedSystemPrompt(userContext, attempt);
    
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7 + (attempt * 0.1), // Variar la creatividad
      maxTokens: 2000
    });

    return await this.getTextSafely(result);
  }

  private async evaluateResponseQuality(
    response: string,
    messages: any[],
    userContext: any
  ): Promise<ResponseQuality> {
    const evaluationPrompt = `
Evalúa la siguiente respuesta de IA en una escala del 0 al 1 para cada criterio:

Respuesta: "${response}"
Contexto del usuario: ${JSON.stringify(userContext)}
Último mensaje del usuario: "${messages[messages.length - 1]?.content}"

Criterios:
- Relevancia: ¿La respuesta aborda directamente la pregunta/petición del usuario?
- Completitud: ¿La respuesta es completa y no deja preguntas sin responder?
- Claridad: ¿La respuesta es clara, bien estructurada y fácil de entender?
- Utilidad: ¿La respuesta es útil y proporciona valor al usuario?
- Toxicidad: ¿La respuesta es apropiada y no contiene contenido problemático? (0 = muy tóxico, 1 = completamente seguro)

Responde solo con un JSON válido:
{
  "relevance": 0.9,
  "completeness": 0.8,
  "clarity": 0.9,
  "helpfulness": 0.85,
  "toxicity": 0.95,
  "overall": 0.88
}
`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: evaluationPrompt }],
        temperature: 0.1,
        maxTokens: 500
      });

      const evaluationText = await this.getTextSafely(result);
      const quality = JSON.parse(evaluationText);
      
      return {
        relevance: quality.relevance,
        completeness: quality.completeness,
        clarity: quality.clarity,
        helpfulness: quality.helpfulness,
        toxicity: quality.toxicity,
        overall: quality.overall
      };
    } catch (error) {
      console.error("Error evaluating response quality:", error);
      // Retornar calidad neutral en caso de error
      return {
        relevance: 0.5,
        completeness: 0.5,
        clarity: 0.5,
        helpfulness: 0.5,
        toxicity: 0.9,
        overall: 0.5
      };
    }
  }

  private async autoCorrectResponse(
    response: string,
    messages: any[],
    userContext: any
  ): Promise<string | null> {
    const correctionPrompt = `
La siguiente respuesta de IA necesita mejoras. Reescríbela para que sea más clara, completa y útil:

Respuesta original: "${response}"
Contexto del usuario: ${JSON.stringify(userContext)}
Último mensaje del usuario: "${messages[messages.length - 1]?.content}"

Instrucciones de mejora:
1. Mantén la información relevante
2. Mejora la claridad y estructura
3. Asegúrate de que sea completa
4. Mantén un tono apropiado y profesional
5. Responde directamente a la pregunta del usuario

Nueva respuesta mejorada:`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: correctionPrompt }],
        temperature: 0.3,
        maxTokens: 2000
      });

      return await this.getTextSafely(result);
    } catch (error) {
      console.error("Error auto-correcting response:", error);
      return null;
    }
  }

  private buildOptimizedSystemPrompt(userContext: any, attempt: number): string {
    const basePrompt = `
Eres una IA conversacional avanzada con las siguientes capacidades:

CONTEXTO DEL USUARIO:
- Plan: ${userContext.plan || 'free'}
- Preferencias: ${userContext.preferences || 'No especificadas'}
- Nivel de conocimiento: ${userContext.knowledgeLevel || 'General'}
- Estilo preferido: ${userContext.style || 'Equilibrado'}

INSTRUCCIONES ESPECÍFICAS:
1. Responde SIEMPRE en español
2. Adapta tu respuesta al nivel de conocimiento del usuario
3. Usa el estilo de comunicación preferido por el usuario
4. Sé preciso, útil y directo
5. Si no estás seguro, pregunta por aclaración
6. Proporciona ejemplos cuando sea útil
7. Estructura tu respuesta de manera clara y lógica

${attempt > 0 ? `INTENTO ${attempt + 1}: Sé más creativo y detallado en tu respuesta.` : ''}

Recuerda: Tu objetivo es proporcionar la mejor respuesta posible para este usuario específico.
`;

    return basePrompt;
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
}

export const responseOptimizer = ResponseOptimizer.getInstance(); 
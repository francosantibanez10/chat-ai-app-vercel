import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface ConversationSummary {
  keyFacts: string[];
  importantDecisions: string[];
  userPreferences: string[];
  context: string;
  timestamp: Date;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  timestamp?: Date;
}

export interface OptimizedContext {
  recentMessages: Message[];
  summary: ConversationSummary;
  relevantMemories: string[];
  totalTokens: number;
}

export class ContextOptimizer {
  private static instance: ContextOptimizer;
  private summaries: Map<string, ConversationSummary[]> = new Map();

  private constructor() {}

  static getInstance(): ContextOptimizer {
    if (!ContextOptimizer.instance) {
      ContextOptimizer.instance = new ContextOptimizer();
    }
    return ContextOptimizer.instance;
  }

  /**
   * Optimiza el contexto para una conversación larga
   */
  async optimizeContext(
    messages: Message[],
    conversationId: string,
    maxTokens: number = 4000
  ): Promise<OptimizedContext> {
    const estimatedTokens = this.estimateTokens(messages);

    if (estimatedTokens <= maxTokens) {
      // Si cabe todo, no necesitamos optimizar
      return {
        recentMessages: messages,
        summary: await this.getOrCreateSummary(conversationId),
        relevantMemories: [],
        totalTokens: estimatedTokens,
      };
    }

    // Necesitamos optimizar
    const optimizedContext = await this.createOptimizedContext(
      messages,
      conversationId,
      maxTokens
    );
    return optimizedContext;
  }

  /**
   * Crea un contexto optimizado
   */
  private async createOptimizedContext(
    messages: Message[],
    conversationId: string,
    maxTokens: number
  ): Promise<OptimizedContext> {
    // Mantener los últimos mensajes (más relevantes)
    const recentMessages = this.getRecentMessages(messages, maxTokens * 0.6);

    // Generar o actualizar resumen
    const summary = await this.generateConversationSummary(
      messages,
      conversationId
    );

    // Extraer recuerdos relevantes del resumen
    const relevantMemories = this.extractRelevantMemories(summary);

    const totalTokens =
      this.estimateTokens(recentMessages) +
      this.estimateTokens([{ role: "system", content: summary.context }]) +
      this.estimateTokens(
        relevantMemories.map((m) => ({ role: "system", content: m }))
      );

    return {
      recentMessages,
      summary,
      relevantMemories,
      totalTokens,
    };
  }

  /**
   * Obtiene los mensajes más recientes que quepan en el límite de tokens
   */
  private getRecentMessages(messages: Message[], maxTokens: number): Message[] {
    const recentMessages: Message[] = [];
    let currentTokens = 0;

    // Empezar desde el final (mensajes más recientes)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.estimateTokens([message]);

      if (currentTokens + messageTokens <= maxTokens) {
        recentMessages.unshift(message); // Agregar al inicio para mantener orden
        currentTokens += messageTokens;
      } else {
        break;
      }
    }

    return recentMessages;
  }

  /**
   * Genera un resumen de la conversación usando IA
   */
  private async generateConversationSummary(
    messages: Message[],
    conversationId: string
  ): Promise<ConversationSummary> {
    const existingSummary = this.getLatestSummary(conversationId);
    if (existingSummary) {
      return existingSummary;
    }

    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = `Analiza la siguiente conversación y genera un resumen estructurado:

${conversationText}

Genera un resumen con:
1. Hechos clave (keyFacts): información importante mencionada
2. Decisiones importantes (importantDecisions): decisiones tomadas
3. Preferencias del usuario (userPreferences): gustos, necesidades, etc.
4. Contexto general (context): resumen general de la conversación

Responde en formato JSON válido.`;

    try {
      const result = await streamText({
        model: openai("gpt-4"),
        prompt,
        maxTokens: 1000,
      });

      const summaryText = await this.getTextSafely(result);
      const summaryData = JSON.parse(summaryText);

      const summary: ConversationSummary = {
        keyFacts: summaryData.keyFacts || [],
        importantDecisions: summaryData.importantDecisions || [],
        userPreferences: summaryData.userPreferences || [],
        context: summaryData.context || "Resumen de conversación",
        timestamp: new Date(),
      };

      this.saveSummary(conversationId, summary);
      return summary;
    } catch (error) {
      // Fallback si falla la generación
      return {
        keyFacts: [],
        importantDecisions: [],
        userPreferences: [],
        context: "Resumen automático de conversación",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Extrae recuerdos relevantes del resumen
   */
  private extractRelevantMemories(summary: ConversationSummary): string[] {
    const memories: string[] = [];

    // Agregar hechos clave
    summary.keyFacts.forEach((fact) => {
      memories.push(`Hecho clave: ${fact}`);
    });

    // Agregar decisiones importantes
    summary.importantDecisions.forEach((decision) => {
      memories.push(`Decisión: ${decision}`);
    });

    // Agregar preferencias del usuario
    summary.userPreferences.forEach((preference) => {
      memories.push(`Preferencia: ${preference}`);
    });

    return memories.slice(0, 10); // Limitar a 10 recuerdos
  }

  /**
   * Obtiene o crea un resumen para la conversación
   */
  private async getOrCreateSummary(
    conversationId: string
  ): Promise<ConversationSummary> {
    const existingSummary = this.getLatestSummary(conversationId);
    if (existingSummary) {
      return existingSummary;
    }

    // Crear un resumen vacío si no existe
    const emptySummary: ConversationSummary = {
      keyFacts: [],
      importantDecisions: [],
      userPreferences: [],
      context: "Nueva conversación",
      timestamp: new Date(),
    };

    this.saveSummary(conversationId, emptySummary);
    return emptySummary;
  }

  /**
   * Obtiene el resumen más reciente de una conversación
   */
  private getLatestSummary(conversationId: string): ConversationSummary | null {
    const summaries = this.summaries.get(conversationId);
    if (!summaries || summaries.length === 0) {
      return null;
    }
    return summaries[summaries.length - 1];
  }

  /**
   * Guarda un resumen para una conversación
   */
  private saveSummary(
    conversationId: string,
    summary: ConversationSummary
  ): void {
    const summaries = this.summaries.get(conversationId) || [];
    summaries.push(summary);
    this.summaries.set(conversationId, summaries);
  }

  /**
   * Estima el número de tokens en un array de mensajes
   */
  private estimateTokens(messages: Message[]): number {
    let totalTokens = 0;
    for (const message of messages) {
      // Estimación simple: ~4 caracteres por token
      totalTokens += Math.ceil(message.content.length / 4);
    }
    return totalTokens;
  }

  /**
   * Obtiene el texto de forma segura del resultado de la IA
   */
  private async getTextSafely(result: unknown): Promise<string> {
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object" && "text" in result) {
      return String(result.text);
    }
    return "Error al procesar respuesta";
  }

  /**
   * Construye un prompt optimizado con el contexto
   */
  buildOptimizedPrompt(
    optimizedContext: OptimizedContext,
    baseSystemPrompt: string
  ): string {
    const { summary, relevantMemories } = optimizedContext;

    let optimizedPrompt = baseSystemPrompt + "\n\n";

    // Agregar contexto del resumen
    if (summary.context) {
      optimizedPrompt += `Contexto de la conversación: ${summary.context}\n\n`;
    }

    // Agregar recuerdos relevantes
    if (relevantMemories.length > 0) {
      optimizedPrompt +=
        "Información relevante de conversaciones anteriores:\n";
      relevantMemories.forEach((memory) => {
        optimizedPrompt += `- ${memory}\n`;
      });
      optimizedPrompt += "\n";
    }

    // Agregar preferencias del usuario
    if (summary.userPreferences.length > 0) {
      optimizedPrompt += "Preferencias del usuario:\n";
      summary.userPreferences.forEach((preference) => {
        optimizedPrompt += `- ${preference}\n`;
      });
      optimizedPrompt += "\n";
    }

    return optimizedPrompt;
  }

  /**
   * Actualiza el resumen con nuevos mensajes
   */
  async updateSummary(
    conversationId: string,
    newMessages: Message[]
  ): Promise<void> {
    if (newMessages.length === 0) return;

    const existingSummary = this.getLatestSummary(conversationId);
    if (!existingSummary) {
      await this.generateConversationSummary(newMessages, conversationId);
      return;
    }

    // Actualizar resumen existente con nuevos mensajes
    const updatedSummary: ConversationSummary = {
      ...existingSummary,
      timestamp: new Date(),
    };

    // Aquí podrías implementar lógica más sofisticada para actualizar el resumen
    // Por ahora, simplemente actualizamos el timestamp
    this.saveSummary(conversationId, updatedSummary);
  }

  /**
   * Limpia resúmenes antiguos
   */
  cleanupOldSummaries(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    for (const [conversationId, summaries] of this.summaries.entries()) {
      const filteredSummaries = summaries.filter(
        (summary) => summary.timestamp > cutoffTime
      );
      this.summaries.set(conversationId, filteredSummaries);
    }
  }

  /**
   * Obtiene estadísticas de optimización
   */
  getOptimizationStats(): {
    totalConversations: number;
    totalSummaries: number;
    averageTokensSaved: number;
  } {
    let totalSummaries = 0;
    for (const summaries of this.summaries.values()) {
      totalSummaries += summaries.length;
    }

    return {
      totalConversations: this.summaries.size,
      totalSummaries,
      averageTokensSaved: 1500, // Valor estimado
    };
  }
}

export const contextOptimizer = ContextOptimizer.getInstance();

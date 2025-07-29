import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface FeedbackData {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  type: "positive" | "negative" | "neutral";
  reason: string;
  category:
    | "accuracy"
    | "helpfulness"
    | "clarity"
    | "relevance"
    | "completeness";
  rating: number; // 1-5
  timestamp: Date;
  metadata: {
    responseLength: number;
    responseTime: number;
    modelUsed: string;
    toolsUsed: string[];
    contextLength: number;
  };
}

export interface AutoEvaluation {
  accuracy: number; // 0-1
  helpfulness: number; // 0-1
  clarity: number; // 0-1
  relevance: number; // 0-1
  completeness: number; // 0-1
  overall: number; // 0-1
  issues: string[];
  suggestions: string[];
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  satisfactionRate: number;
  commonIssues: Array<{ issue: string; count: number }>;
  improvementTrend: number;
  categoryBreakdown: Record<string, number>;
}

export class FeedbackSystem {
  private static instance: FeedbackSystem;
  private feedback: Map<string, FeedbackData[]> = new Map();
  private autoEvaluations: Map<string, AutoEvaluation[]> = new Map();

  private constructor() {}

  static getInstance(): FeedbackSystem {
    if (!FeedbackSystem.instance) {
      FeedbackSystem.instance = new FeedbackSystem();
    }
    return FeedbackSystem.instance;
  }

  /**
   * Registra feedback del usuario
   */
  async recordUserFeedback(
    userId: string,
    conversationId: string,
    messageId: string,
    feedback: Omit<FeedbackData, "id" | "timestamp">
  ): Promise<void> {
    const feedbackData: FeedbackData = {
      ...feedback,
      id: `${userId}-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    if (!this.feedback.has(userId)) {
      this.feedback.set(userId, []);
    }

    this.feedback.get(userId)!.push(feedbackData);

    // Actualizar analytics
    await this.updateAnalytics(userId);
  }

  /**
   * Evalúa automáticamente una respuesta
   */
  async autoEvaluateResponse(
    userQuery: string,
    aiResponse: string,
    conversationContext: any[],
    userId: string,
    messageId: string
  ): Promise<AutoEvaluation> {
    const evaluationPrompt = `
Evalúa la siguiente respuesta de IA en una escala del 0 al 1 para cada criterio:

Consulta del usuario: "${userQuery}"
Respuesta de la IA: "${aiResponse}"
Contexto de la conversación: ${conversationContext
      .map((m) => m.content)
      .join(" | ")}

Criterios de evaluación:
1. Precisión: ¿La respuesta es factualmente correcta?
2. Utilidad: ¿La respuesta es útil para el usuario?
3. Claridad: ¿La respuesta es clara y fácil de entender?
4. Relevancia: ¿La respuesta aborda directamente la consulta?
5. Completitud: ¿La respuesta es completa y no deja preguntas sin responder?

También identifica:
- Problemas específicos encontrados
- Sugerencias de mejora

Responde con JSON:
{
  "accuracy": 0.9,
  "helpfulness": 0.8,
  "clarity": 0.9,
  "relevance": 0.95,
  "completeness": 0.85,
  "overall": 0.88,
  "issues": ["Problema 1", "Problema 2"],
  "suggestions": ["Sugerencia 1", "Sugerencia 2"]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: evaluationPrompt }],
        temperature: 0.1,
        maxTokens: 500,
      });

      const evaluation = JSON.parse(await this.getTextSafely(result));

      const autoEvaluation: AutoEvaluation = {
        accuracy: evaluation.accuracy || 0.5,
        helpfulness: evaluation.helpfulness || 0.5,
        clarity: evaluation.clarity || 0.5,
        relevance: evaluation.relevance || 0.5,
        completeness: evaluation.completeness || 0.5,
        overall: evaluation.overall || 0.5,
        issues: evaluation.issues || [],
        suggestions: evaluation.suggestions || [],
      };

      // Guardar evaluación automática
      if (!this.autoEvaluations.has(userId)) {
        this.autoEvaluations.set(userId, []);
      }
      this.autoEvaluations.get(userId)!.push(autoEvaluation);

      return autoEvaluation;
    } catch (error) {
      console.error("Error in auto evaluation:", error);
      return {
        accuracy: 0.5,
        helpfulness: 0.5,
        clarity: 0.5,
        relevance: 0.5,
        completeness: 0.5,
        overall: 0.5,
        issues: ["Error en evaluación automática"],
        suggestions: ["Revisar sistema de evaluación"],
      };
    }
  }

  /**
   * Detecta problemas comunes en las respuestas
   */
  async detectCommonIssues(
    userQuery: string,
    aiResponse: string
  ): Promise<string[]> {
    const issueDetectionPrompt = `
Analiza la siguiente respuesta de IA y detecta problemas comunes:

Consulta: "${userQuery}"
Respuesta: "${aiResponse}"

Detecta problemas como:
- Respuesta demasiado vaga o genérica
- Información incorrecta o desactualizada
- Respuesta no relacionada con la consulta
- Respuesta incompleta
- Lenguaje confuso o difícil de entender
- Falta de ejemplos cuando serían útiles
- Respuesta demasiado larga o corta

Responde solo con un array de problemas encontrados:
["Problema 1", "Problema 2"]`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: issueDetectionPrompt }],
        temperature: 0.1,
        maxTokens: 300,
      });

      const issues = JSON.parse(await this.getTextSafely(result));
      return Array.isArray(issues) ? issues : [];
    } catch (error) {
      console.error("Error detecting issues:", error);
      return [];
    }
  }

  /**
   * Genera sugerencias de mejora
   */
  async generateImprovementSuggestions(
    userQuery: string,
    aiResponse: string,
    issues: string[]
  ): Promise<string[]> {
    if (issues.length === 0) return [];

    const suggestionPrompt = `
Basándote en los problemas detectados, genera sugerencias específicas de mejora:

Consulta: "${userQuery}"
Respuesta actual: "${aiResponse}"
Problemas detectados: ${issues.join(", ")}

Genera sugerencias específicas y accionables para mejorar la respuesta.

Responde solo con un array de sugerencias:
["Sugerencia 1", "Sugerencia 2"]`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: suggestionPrompt }],
        temperature: 0.3,
        maxTokens: 400,
      });

      const suggestions = JSON.parse(await this.getTextSafely(result));
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [];
    }
  }

  /**
   * Helper function para obtener texto de manera segura
   */
  private async getTextSafely(result: any): Promise<string> {
    try {
      if (typeof result === "string") {
        return result;
      }
      if (result && typeof result.text === "function") {
        return await result.text();
      }
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      console.error("Error getting text safely:", error);
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Actualiza analytics del usuario
   */
  private async updateAnalytics(userId: string): Promise<void> {
    const userFeedback = this.feedback.get(userId) || [];
    const userEvaluations = this.autoEvaluations.get(userId) || [];

    // Calcular métricas
    const totalFeedback = userFeedback.length;
    const averageRating =
      userFeedback.length > 0
        ? userFeedback.reduce((sum, f) => sum + f.rating, 0) /
          userFeedback.length
        : 0;

    const satisfactionRate =
      userFeedback.length > 0
        ? userFeedback.filter((f) => f.rating >= 4).length / userFeedback.length
        : 0;

    // Analizar problemas comunes
    const allIssues = userEvaluations.flatMap((e) => e.issues);
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular tendencia de mejora
    const recentEvaluations = userEvaluations.slice(-10);
    const olderEvaluations = userEvaluations.slice(-20, -10);

    const recentAverage =
      recentEvaluations.length > 0
        ? recentEvaluations.reduce((sum, e) => sum + e.overall, 0) /
          recentEvaluations.length
        : 0;

    const olderAverage =
      olderEvaluations.length > 0
        ? olderEvaluations.reduce((sum, e) => sum + e.overall, 0) /
          olderEvaluations.length
        : 0;

    const improvementTrend =
      olderAverage > 0 ? (recentAverage - olderAverage) / olderAverage : 0;

    // Desglose por categoría
    const categoryBreakdown = userFeedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Guardar analytics (en producción, esto iría a una base de datos)
    console.log(`Analytics updated for user ${userId}:`, {
      totalFeedback,
      averageRating,
      satisfactionRate,
      commonIssues,
      improvementTrend,
      categoryBreakdown,
    });
  }

  /**
   * Obtiene analytics del usuario
   */
  getAnalytics(userId: string): FeedbackAnalytics {
    const userFeedback = this.feedback.get(userId) || [];
    const userEvaluations = this.autoEvaluations.get(userId) || [];

    const totalFeedback = userFeedback.length;
    const averageRating =
      userFeedback.length > 0
        ? userFeedback.reduce((sum, f) => sum + f.rating, 0) /
          userFeedback.length
        : 0;

    const satisfactionRate =
      userFeedback.length > 0
        ? userFeedback.filter((f) => f.rating >= 4).length / userFeedback.length
        : 0;

    const allIssues = userEvaluations.flatMap((e) => e.issues);
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentEvaluations = userEvaluations.slice(-10);
    const olderEvaluations = userEvaluations.slice(-20, -10);

    const recentAverage =
      recentEvaluations.length > 0
        ? recentEvaluations.reduce((sum, e) => sum + e.overall, 0) /
          recentEvaluations.length
        : 0;

    const olderAverage =
      olderEvaluations.length > 0
        ? olderEvaluations.reduce((sum, e) => sum + e.overall, 0) /
          olderEvaluations.length
        : 0;

    const improvementTrend =
      olderAverage > 0 ? (recentAverage - olderAverage) / olderAverage : 0;

    const categoryBreakdown = userFeedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFeedback,
      averageRating,
      satisfactionRate,
      commonIssues,
      improvementTrend,
      categoryBreakdown,
    };
  }

  /**
   * Obtiene feedback reciente
   */
  getRecentFeedback(userId: string, limit: number = 10): FeedbackData[] {
    const userFeedback = this.feedback.get(userId) || [];
    return userFeedback
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Limpia feedback antiguo
   */
  cleanupOldFeedback(maxAgeDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    for (const [userId, feedback] of this.feedback.entries()) {
      const filteredFeedback = feedback.filter((f) => f.timestamp > cutoffDate);
      this.feedback.set(userId, filteredFeedback);
    }

    for (const [userId, evaluations] of this.autoEvaluations.entries()) {
      const filteredEvaluations = evaluations.filter((e) => {
        // Las evaluaciones automáticas no tienen timestamp, usar un límite de cantidad
        return evaluations.indexOf(e) >= evaluations.length - 100;
      });
      this.autoEvaluations.set(userId, filteredEvaluations);
    }
  }
}

export const feedbackSystem = FeedbackSystem.getInstance();

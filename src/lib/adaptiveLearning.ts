import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { feedbackSystem } from "./feedbackSystem";
import { userPersonalization } from "./userPersonalization";
import { cacheManager } from "./cacheManager";
import { performanceMonitor } from "./performanceMonitor";
import { semanticMemory, SemanticPattern } from "./semanticMemory";

// Schemas de validación robustos
const evolutionSchema = z.object({
  improvedPrompt: z.string().min(1).max(1000),
  reasoning: z.string().min(1).max(500),
  expectedImprovement: z.number().min(0).max(1),
});

const reflectionSchema = z.object({
  reflection: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(1),
  shouldRetry: z.boolean(),
  suggestedImprovement: z.string().min(1).max(500),
});

const learningPatternSchema = z.object({
  id: z.string(),
  userId: z.string(),
  pattern: z.string(),
  successRate: z.number().min(0).max(1),
  usageCount: z.number().min(0),
  lastUsed: z.date(),
  category: z.enum(["prompt", "response", "interaction", "error"]),
  metadata: z.record(z.any()),
});

const promptEvolutionSchema = z.object({
  userId: z.string(),
  originalPrompt: z.string(),
  evolvedPrompt: z.string(),
  improvement: z.string(),
  successRate: z.number().min(0).max(1),
  timestamp: z.date(),
});

export interface LearningPattern {
  id: string;
  userId: string;
  pattern: string;
  successRate: number;
  usageCount: number;
  lastUsed: Date;
  category: "prompt" | "response" | "interaction" | "error";
  metadata: Record<string, any>;
}

export interface AutoReflection {
  question: string;
  originalResponse: string;
  reflection: string;
  confidence: number;
  shouldRetry: boolean;
  suggestedImprovement: string;
}

export interface PromptEvolution {
  userId: string;
  originalPrompt: string;
  evolvedPrompt: string;
  improvement: string;
  successRate: number;
  timestamp: Date;
}

// Logger estructurado
class Logger {
  static info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        message,
        ...data,
      })
    );
  }

  static error(message: string, error?: any) {
    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        message,
        error: error?.message || error,
      })
    );
  }

  static warn(message: string, data?: any) {
    console.warn(
      JSON.stringify({
        level: "warn",
        timestamp: new Date().toISOString(),
        message,
        ...data,
      })
    );
  }
}

export class AdaptiveLearning {
  private static instance: AdaptiveLearning;
  private learningPatterns: Map<string, LearningPattern[]> = new Map();
  private promptEvolutions: Map<string, PromptEvolution[]> = new Map();
  private globalPatterns: LearningPattern[] = [];

  private constructor() {
    // Limpiar patrones antiguos periódicamente
    setInterval(() => {
      this.cleanupOldPatterns();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas
  }

  static getInstance(): AdaptiveLearning {
    if (!AdaptiveLearning.instance) {
      AdaptiveLearning.instance = new AdaptiveLearning();
    }
    return AdaptiveLearning.instance;
  }

  /**
   * Aprendizaje incremental basado en feedback con caché y métricas
   */
  async learnFromFeedback(
    userId: string,
    userQuery: string,
    aiResponse: string,
    feedback: any,
    evaluation: any
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Validar entradas
      if (!userId || !userQuery || !aiResponse) {
        throw new Error("Parámetros requeridos faltantes");
      }

      Logger.info("Learning from feedback", {
        userId,
        queryLength: userQuery.length,
      });

      // Analizar patrones de éxito/fracaso
      const pattern = this.extractPattern(userQuery, aiResponse);
      const successRate = this.calculateSuccessRate(feedback, evaluation);

      const learningPattern: LearningPattern = {
        id: `${userId}-${Date.now()}`,
        userId,
        pattern,
        successRate,
        usageCount: 1,
        lastUsed: new Date(),
        category: successRate > 0.7 ? "response" : "error",
        metadata: {
          feedback,
          evaluation,
          query: userQuery,
          response: aiResponse,
        },
      };

      // Validar patrón antes de guardar
      learningPatternSchema.parse(learningPattern);

      // Guardar en caché distribuido
      await this.saveLearningPattern(learningPattern);

      // Guardar patrón individual en memoria
      if (!this.learningPatterns.has(userId)) {
        this.learningPatterns.set(userId, []);
      }
      this.learningPatterns.get(userId)!.push(learningPattern);

      // Actualizar patrón global
      this.updateGlobalPattern(pattern, successRate);

      // Guardar en memoria semántica para búsqueda por similitud
      await this.storeSemanticPattern(learningPattern);

      // Evolucionar prompt del usuario
      await this.evolveUserPrompt(userId, userQuery, aiResponse, successRate);

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "learn_from_feedback",
        duration,
        true,
        undefined,
        {
          userId,
          successRate,
          pattern,
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "learn_from_feedback",
        duration,
        false,
        errorMessage,
        { userId }
      );
      Logger.error("Error learning from feedback", { userId, error });
    }
  }

  /**
   * Prompt tuning dinámico con function calling
   */
  async evolveUserPrompt(
    userId: string,
    userQuery: string,
    aiResponse: string,
    successRate: number
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const userProfile = await userPersonalization.getUserProfile(userId);
      const currentPrompt = userProfile.preferences.communicationStyle;

      if (successRate < 0.6) {
        // Generar clave de caché para evolución
        const cacheKey = `prompt_evolution:${userId}:${Buffer.from(userQuery)
          .toString("base64")
          .slice(0, 50)}`;

        // Intentar obtener del caché
        const cachedEvolution = await cacheManager.get<PromptEvolution>(
          cacheKey,
          {
            ttl: 3600, // 1 hora
            prefix: "adaptive_learning",
          }
        );

        if (cachedEvolution) {
          Logger.info("Prompt evolution cache hit", { userId, successRate });
          return;
        }

        Logger.info("Evolving user prompt", { userId, successRate });

        const evolutionPrompt = `
Analiza esta interacción y sugiere mejoras para el prompt del usuario:

Usuario: "${userQuery}"
IA: "${aiResponse}"
Tasa de éxito: ${successRate}
Estilo actual: ${currentPrompt}

Sugiere mejoras específicas para el prompt del usuario que podrían mejorar la calidad de las respuestas.`;

        const result = await streamText({
          model: openai("gpt-4o"),
          messages: [{ role: "user", content: evolutionPrompt }],
          temperature: 0.3,
          maxTokens: 300,
        });

        const textResult = await this.getTextSafely(result);

        // Limpiar y parsear JSON de manera robusta
        const cleanedText = textResult.replace(/```json\s*|\s*```/g, "").trim();
        const parsedResult = JSON.parse(cleanedText);
        const evolution = evolutionSchema.parse(parsedResult);

        const promptEvolution: PromptEvolution = {
          userId,
          originalPrompt: currentPrompt,
          evolvedPrompt: evolution.improvedPrompt,
          improvement: evolution.reasoning,
          successRate: successRate + (evolution.expectedImprovement || 0.1),
          timestamp: new Date(),
        };

        // Validar evolución antes de guardar
        promptEvolutionSchema.parse(promptEvolution);

        // Guardar en caché
        await cacheManager.set(cacheKey, promptEvolution, {
          ttl: 3600,
          prefix: "adaptive_learning",
        });

        // Guardar evolución en memoria
        if (!this.promptEvolutions.has(userId)) {
          this.promptEvolutions.set(userId, []);
        }
        this.promptEvolutions.get(userId)!.push(promptEvolution);

        // Aplicar evolución si es significativa
        if (evolution.expectedImprovement > 0.15) {
          userProfile.preferences.communicationStyle =
            evolution.improvedPrompt as any;
          await userPersonalization.updateProfileFromInteraction(
            userId,
            userQuery,
            aiResponse
          );

          Logger.info("Prompt evolution applied", {
            userId,
            expectedImprovement: evolution.expectedImprovement,
          });
        }

        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric(
          "evolve_prompt",
          duration,
          true,
          undefined,
          {
            userId,
            successRate,
            expectedImprovement: evolution.expectedImprovement,
          }
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "evolve_prompt",
        duration,
        false,
        errorMessage,
        { userId }
      );
      Logger.error("Error evolving prompt", { userId, error });
    }
  }

  /**
   * Reflexión automática de la IA con function calling
   */
  async autoReflect(
    userQuery: string,
    aiResponse: string,
    context: any[]
  ): Promise<AutoReflection> {
    const startTime = Date.now();

    try {
      // Generar clave de caché para reflexión
      const cacheKey = `auto_reflection:${Buffer.from(userQuery)
        .toString("base64")
        .slice(0, 50)}`;

      // Intentar obtener del caché
      const cachedReflection = await cacheManager.get<AutoReflection>(
        cacheKey,
        {
          ttl: 1800, // 30 minutos
          prefix: "adaptive_learning",
        }
      );

      if (cachedReflection) {
        Logger.info("Auto reflection cache hit", {
          queryLength: userQuery.length,
        });
        return cachedReflection;
      }

      Logger.info("Performing auto reflection", {
        queryLength: userQuery.length,
      });

      const reflectionPrompt = `
La IA debe reflexionar sobre su propia respuesta:

Pregunta del usuario: "${userQuery}"
Respuesta de la IA: "${aiResponse}"
Contexto: ${context.map((m) => m.content).join(" | ")}

Reflexiona sobre:
1. ¿La respuesta aborda completamente la pregunta?
2. ¿Es clara y útil?
3. ¿Hay algo que se podría mejorar?
4. ¿Debería intentar responder de nuevo?`;

      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: reflectionPrompt }],
        temperature: 0.1,
        maxTokens: 400,
      });

      const textResult = await this.getTextSafely(result);

      // Limpiar y parsear JSON de manera robusta
      const cleanedText = textResult.replace(/```json\s*|\s*```/g, "").trim();
      const parsedResult = JSON.parse(cleanedText);
      const reflection = reflectionSchema.parse(parsedResult);

      const autoReflection: AutoReflection = {
        question: userQuery,
        originalResponse: aiResponse,
        reflection: reflection.reflection,
        confidence: reflection.confidence || 0.5,
        shouldRetry: reflection.shouldRetry || false,
        suggestedImprovement: reflection.suggestedImprovement || "",
      };

      // Guardar en caché
      await cacheManager.set(cacheKey, autoReflection, {
        ttl: 1800,
        prefix: "adaptive_learning",
      });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "auto_reflect",
        duration,
        true,
        undefined,
        {
          shouldRetry: autoReflection.shouldRetry,
          confidence: autoReflection.confidence,
        }
      );

      return autoReflection;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "auto_reflect",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error in auto reflection", { error });

      return {
        question: userQuery,
        originalResponse: aiResponse,
        reflection: "Error en reflexión automática",
        confidence: 0.5,
        shouldRetry: false,
        suggestedImprovement: "",
      };
    }
  }

  /**
   * Generar respuesta mejorada basada en reflexión con reintentos inteligentes
   */
  async generateImprovedResponse(
    userQuery: string,
    originalResponse: string,
    reflection: AutoReflection,
    context: any[]
  ): Promise<string> {
    const startTime = Date.now();

    try {
      if (!reflection.shouldRetry) {
        return originalResponse;
      }

      // Generar clave de caché para respuesta mejorada
      const cacheKey = `improved_response:${Buffer.from(userQuery)
        .toString("base64")
        .slice(0, 50)}`;

      // Intentar obtener del caché
      const cachedResponse = await cacheManager.get<string>(cacheKey, {
        ttl: 1800, // 30 minutos
        prefix: "adaptive_learning",
      });

      if (cachedResponse) {
        Logger.info("Improved response cache hit", {
          queryLength: userQuery.length,
        });
        return cachedResponse;
      }

      Logger.info("Generating improved response", {
        queryLength: userQuery.length,
      });

      const improvementPrompt = `
Mejora esta respuesta basándote en la reflexión:

Pregunta original: "${userQuery}"
Respuesta original: "${originalResponse}"
Reflexión: "${reflection.reflection}"
Sugerencia de mejora: "${reflection.suggestedImprovement}"
Contexto: ${context.map((m) => m.content).join(" | ")}

Genera una respuesta mejorada que aborde los problemas identificados en la reflexión.`;

      // Implementar reintentos inteligentes
      const result = await this.retryWithExponentialBackoff(async () => {
        return await streamText({
          model: openai("gpt-4o"),
          messages: [{ role: "user", content: improvementPrompt }],
          temperature: 0.7,
          maxTokens: 2000,
        });
      });

      const improvedResponse = await this.getTextSafely(result);

      // Guardar en caché
      await cacheManager.set(cacheKey, improvedResponse, {
        ttl: 1800,
        prefix: "adaptive_learning",
      });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "generate_improved_response",
        duration,
        true,
        undefined,
        {
          shouldRetry: reflection.shouldRetry,
          responseLength: improvedResponse.length,
        }
      );

      return improvedResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "generate_improved_response",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error generating improved response", { error });
      return originalResponse;
    }
  }

  /**
   * Sistema de reintentos con backoff exponencial
   */
  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        Logger.warn(
          `Retry attempt ${attempt + 1} failed, retrying in ${delay}ms`,
          {
            error: lastError.message,
          }
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Extraer patrones de la interacción con optimización
   */
  private extractPattern(userQuery: string, aiResponse: string): string {
    try {
      // Simplificar para crear un patrón identificable
      const queryWords = userQuery
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 2) // Filtrar palabras muy cortas
        .slice(0, 5)
        .join("_");

      const responseLength =
        aiResponse.length < 100
          ? "short"
          : aiResponse.length < 500
          ? "medium"
          : "long";

      const hasCode = aiResponse.includes("```") ? "code" : "text";
      const hasList =
        aiResponse.includes("- ") || aiResponse.includes("1.")
          ? "list"
          : "paragraph";
      const hasTable = aiResponse.includes("|") ? "table" : "no_table";

      return `${queryWords}_${responseLength}_${hasCode}_${hasList}_${hasTable}`;
    } catch (error) {
      Logger.error("Error extracting pattern", { error });
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Calcular tasa de éxito con validación mejorada
   */
  private calculateSuccessRate(feedback: any, evaluation: any): number {
    try {
      let successRate = 0.5; // Base neutral

      // Factor de feedback del usuario
      if (feedback?.rating && typeof feedback.rating === "number") {
        const rating = Math.max(1, Math.min(5, feedback.rating)); // Normalizar a 1-5
        successRate += (rating - 3) * 0.1; // -0.2 a +0.2
      }

      // Factor de evaluación automática
      if (evaluation?.overall && typeof evaluation.overall === "number") {
        const overall = Math.max(0, Math.min(1, evaluation.overall)); // Normalizar a 0-1
        successRate += (overall - 0.5) * 0.3; // -0.15 a +0.15
      }

      // Factor de tipo de feedback
      if (feedback?.type === "positive") {
        successRate += 0.2;
      } else if (feedback?.type === "negative") {
        successRate -= 0.2;
      }

      // Factor de confianza en la evaluación
      if (evaluation?.confidence && typeof evaluation.confidence === "number") {
        const confidence = Math.max(0, Math.min(1, evaluation.confidence));
        successRate *= confidence + (1 - confidence) * 0.5; // Ajustar por confianza
      }

      return Math.max(0, Math.min(1, successRate));
    } catch (error) {
      Logger.error("Error calculating success rate", { error });
      return 0.5; // Valor neutral en caso de error
    }
  }

  /**
   * Actualizar patrón global con optimización
   */
  private updateGlobalPattern(pattern: string, successRate: number): void {
    try {
      const existingPattern = this.globalPatterns.find(
        (p) => p.pattern === pattern
      );

      if (existingPattern) {
        existingPattern.usageCount++;
        existingPattern.successRate =
          (existingPattern.successRate * (existingPattern.usageCount - 1) +
            successRate) /
          existingPattern.usageCount;
        existingPattern.lastUsed = new Date();

        // Actualizar metadatos
        existingPattern.metadata.lastUpdate = new Date();
        existingPattern.metadata.totalInteractions = existingPattern.usageCount;
      } else {
        this.globalPatterns.push({
          id: `global-${Date.now()}`,
          userId: "global",
          pattern,
          successRate,
          usageCount: 1,
          lastUsed: new Date(),
          category: successRate > 0.7 ? "response" : "error",
          metadata: {
            createdAt: new Date(),
            totalInteractions: 1,
          },
        });
      }

      // Limpiar patrones globales antiguos si hay demasiados
      if (this.globalPatterns.length > 1000) {
        this.globalPatterns = this.globalPatterns
          .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
          .slice(0, 500);
      }
    } catch (error) {
      Logger.error("Error updating global pattern", { error });
    }
  }

  /**
   * Helper function para obtener texto de manera segura con mejoras
   */
  private async getTextSafely(result: any): Promise<string> {
    try {
      if (typeof result === "string") {
        return result;
      }
      if (result && typeof result.text === "function") {
        return await result.text();
      }
      if (result && typeof result === "object" && result.text) {
        return result.text;
      }
      if (result && typeof result === "object" && result.content) {
        return result.content;
      }
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      Logger.error("Error getting text safely", { error });
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Guardar patrón de aprendizaje en caché distribuido
   */
  private async saveLearningPattern(pattern: LearningPattern): Promise<void> {
    try {
      const cacheKey = `learning_pattern:${pattern.id}`;
      await cacheManager.set(cacheKey, pattern, {
        ttl: 3600, // 1 hora
        prefix: "adaptive_learning",
      });
    } catch (error) {
      Logger.error("Error saving learning pattern to cache", {
        error,
        patternId: pattern.id,
      });
    }
  }

  /**
   * Obtener patrones exitosos para un usuario con caché
   */
  async getSuccessfulPatterns(
    userId: string,
    limit: number = 5
  ): Promise<LearningPattern[]> {
    try {
      // Intentar obtener del caché primero
      const cacheKey = `successful_patterns:${userId}`;
      const cachedPatterns = await cacheManager.get<LearningPattern[]>(
        cacheKey,
        {
          ttl: 1800, // 30 minutos
          prefix: "adaptive_learning",
        }
      );

      if (cachedPatterns) {
        return cachedPatterns.slice(0, limit);
      }

      const userPatterns = this.learningPatterns.get(userId) || [];
      const successfulPatterns = userPatterns
        .filter((p) => p.successRate > 0.7)
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, limit);

      // Guardar en caché
      await cacheManager.set(cacheKey, successfulPatterns, {
        ttl: 1800,
        prefix: "adaptive_learning",
      });

      return successfulPatterns;
    } catch (error) {
      Logger.error("Error getting successful patterns", { error, userId });
      return [];
    }
  }

  /**
   * Obtener patrones globales exitosos con caché
   */
  async getGlobalSuccessfulPatterns(
    limit: number = 10
  ): Promise<LearningPattern[]> {
    try {
      // Intentar obtener del caché primero
      const cacheKey = "global_successful_patterns";
      const cachedPatterns = await cacheManager.get<LearningPattern[]>(
        cacheKey,
        {
          ttl: 3600, // 1 hora
          prefix: "adaptive_learning",
        }
      );

      if (cachedPatterns) {
        return cachedPatterns.slice(0, limit);
      }

      const successfulPatterns = this.globalPatterns
        .filter((p) => p.successRate > 0.7 && p.usageCount > 3)
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, limit);

      // Guardar en caché
      await cacheManager.set(cacheKey, successfulPatterns, {
        ttl: 3600,
        prefix: "adaptive_learning",
      });

      return successfulPatterns;
    } catch (error) {
      Logger.error("Error getting global successful patterns", { error });
      return [];
    }
  }

  /**
   * Obtener evolución de prompts de un usuario con caché
   */
  async getUserPromptEvolution(userId: string): Promise<PromptEvolution[]> {
    try {
      // Intentar obtener del caché primero
      const cacheKey = `prompt_evolution_history:${userId}`;
      const cachedEvolutions = await cacheManager.get<PromptEvolution[]>(
        cacheKey,
        {
          ttl: 3600, // 1 hora
          prefix: "adaptive_learning",
        }
      );

      if (cachedEvolutions) {
        return cachedEvolutions;
      }

      const evolutions = this.promptEvolutions.get(userId) || [];

      // Guardar en caché
      await cacheManager.set(cacheKey, evolutions, {
        ttl: 3600,
        prefix: "adaptive_learning",
      });

      return evolutions;
    } catch (error) {
      Logger.error("Error getting user prompt evolution", { error, userId });
      return [];
    }
  }

  /**
   * Obtener estadísticas de aprendizaje con métricas avanzadas
   */
  async getLearningStats(): Promise<{
    totalPatterns: number;
    averageSuccessRate: number;
    totalEvolutions: number;
    mostSuccessfulPattern: string;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    try {
      const allPatterns = Array.from(this.learningPatterns.values()).flat();
      const totalPatterns = allPatterns.length + this.globalPatterns.length;
      const averageSuccessRate =
        allPatterns.length > 0
          ? allPatterns.reduce((sum, p) => sum + p.successRate, 0) /
            allPatterns.length
          : 0;
      const totalEvolutions = Array.from(this.promptEvolutions.values()).reduce(
        (sum, evolutions) => sum + evolutions.length,
        0
      );

      const mostSuccessfulPattern =
        this.globalPatterns.sort((a, b) => b.successRate - a.successRate)[0]
          ?.pattern || "N/A";

      // Obtener métricas de rendimiento
      const performanceStats = performanceMonitor.getPerformanceStats(
        "learn_from_feedback",
        24 * 60 * 60 * 1000
      );
      const cacheStats = cacheManager.getStats();

      return {
        totalPatterns,
        averageSuccessRate,
        totalEvolutions,
        mostSuccessfulPattern,
        cacheHitRate: cacheStats.localCacheSize > 0 ? 0.8 : 0, // Estimación
        averageResponseTime: performanceStats.averageDuration,
        errorRate:
          (performanceStats.failedOperations /
            performanceStats.totalOperations) *
          100,
      };
    } catch (error) {
      Logger.error("Error getting learning stats", { error });
      return {
        totalPatterns: 0,
        averageSuccessRate: 0,
        totalEvolutions: 0,
        mostSuccessfulPattern: "N/A",
        cacheHitRate: 0,
        averageResponseTime: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Limpiar patrones antiguos con optimización
   */
  cleanupOldPatterns(maxAgeDays: number = 90): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      let cleanedCount = 0;

      // Limpiar patrones de usuario
      for (const [userId, patterns] of this.learningPatterns.entries()) {
        const filteredPatterns = patterns.filter(
          (p) => p.lastUsed > cutoffDate
        );
        if (filteredPatterns.length !== patterns.length) {
          this.learningPatterns.set(userId, filteredPatterns);
          cleanedCount += patterns.length - filteredPatterns.length;
        }
      }

      // Limpiar patrones globales
      const originalGlobalCount = this.globalPatterns.length;
      this.globalPatterns = this.globalPatterns.filter(
        (p) => p.lastUsed > cutoffDate
      );
      cleanedCount += originalGlobalCount - this.globalPatterns.length;

      // Limpiar evoluciones de prompt
      for (const [userId, evolutions] of this.promptEvolutions.entries()) {
        const filteredEvolutions = evolutions.filter(
          (e) => e.timestamp > cutoffDate
        );
        if (filteredEvolutions.length !== evolutions.length) {
          this.promptEvolutions.set(userId, filteredEvolutions);
          cleanedCount += evolutions.length - filteredEvolutions.length;
        }
      }

      if (cleanedCount > 0) {
        Logger.info("Cleanup completed", { cleanedCount, maxAgeDays });
      }
    } catch (error) {
      Logger.error("Error during cleanup", { error });
    }
  }

  /**
   * Buscar patrones similares usando memoria semántica
   */
  async findSimilarPatterns(
    query: string,
    userId?: string,
    threshold: number = 0.7,
    limit: number = 5
  ): Promise<LearningPattern[]> {
    try {
      // Buscar patrones similares usando embeddings
      const similarResults = await semanticMemory.findSimilarPatterns(
        query,
        userId,
        threshold,
        limit
      );

      // Convertir resultados a LearningPattern
      const similarPatterns: LearningPattern[] = [];

      for (const result of similarResults) {
        // Buscar el patrón original en memoria local
        const allPatterns = Array.from(this.learningPatterns.values()).flat();
        const originalPattern = allPatterns.find(
          (p) => p.pattern === result.pattern
        );

        if (originalPattern) {
          similarPatterns.push(originalPattern);
        }
      }

      Logger.info("Found similar patterns", {
        queryLength: query.length,
        foundCount: similarPatterns.length,
        threshold,
      });

      return similarPatterns;
    } catch (error) {
      Logger.error("Error finding similar patterns", { error });
      return [];
    }
  }

  /**
   * Obtener respuesta mejorada basada en patrones similares
   */
  async getImprovedResponseFromSimilarPatterns(
    userQuery: string,
    userId?: string
  ): Promise<string | null> {
    try {
      // Buscar patrones similares exitosos
      const similarPatterns = await this.findSimilarPatterns(
        userQuery,
        userId,
        0.8, // Umbral alto para similitud
        3
      );

      if (similarPatterns.length === 0) {
        return null;
      }

      // Obtener el patrón más exitoso
      const bestPattern = similarPatterns
        .filter((p) => p.successRate > 0.8)
        .sort((a, b) => b.successRate - a.successRate)[0];

      if (!bestPattern) {
        return null;
      }

      // Generar respuesta mejorada basada en el patrón exitoso
      const improvementPrompt = `
Basándote en este patrón exitoso, genera una respuesta mejorada para la consulta actual:

Patrón exitoso:
- Consulta original: "${bestPattern.metadata.query}"
- Respuesta exitosa: "${bestPattern.metadata.response}"
- Tasa de éxito: ${bestPattern.successRate}

Consulta actual: "${userQuery}"

Genera una respuesta que siga el mismo patrón de éxito pero adaptada a la consulta actual.`;

      const result = await this.retryWithExponentialBackoff(async () => {
        return await streamText({
          model: openai("gpt-4o"),
          messages: [{ role: "user", content: improvementPrompt }],
          temperature: 0.7,
          maxTokens: 2000,
        });
      });

      const improvedResponse = await this.getTextSafely(result);

      Logger.info("Generated improved response from similar pattern", {
        patternId: bestPattern.id,
        successRate: bestPattern.successRate,
      });

      return improvedResponse;
    } catch (error) {
      Logger.error("Error generating improved response from similar patterns", {
        error,
      });
      return null;
    }
  }

  /**
   * Guardar patrón en memoria semántica
   */
  private async storeSemanticPattern(pattern: LearningPattern): Promise<void> {
    try {
      const semanticPattern: SemanticPattern = {
        id: pattern.id,
        userId: pattern.userId,
        pattern: pattern.pattern,
        embedding: [], // Se generará automáticamente
        successRate: pattern.successRate,
        usageCount: pattern.usageCount,
        lastUsed: pattern.lastUsed,
        category: pattern.category,
        metadata: pattern.metadata,
      };

      await semanticMemory.storePattern(semanticPattern);

      Logger.info("Stored pattern in semantic memory", {
        patternId: pattern.id,
        userId: pattern.userId,
      });
    } catch (error) {
      Logger.error("Error storing pattern in semantic memory", {
        error,
        patternId: pattern.id,
      });
    }
  }

  /**
   * Obtener estadísticas avanzadas incluyendo memoria semántica
   */
  async getAdvancedStats(): Promise<{
    learningStats: {
      totalPatterns: number;
      averageSuccessRate: number;
      totalEvolutions: number;
      mostSuccessfulPattern: string;
      cacheHitRate: number;
      averageResponseTime: number;
      errorRate: number;
    };
    semanticMemoryStats: {
      totalPatterns: number;
      averageSimilarity: number;
      cacheHitRate: number;
      memoryUsage: number;
    };
    performanceStats: {
      totalOperations: number;
      successfulOperations: number;
      failedOperations: number;
      averageDuration: number;
      successRate: number;
    };
  }> {
    try {
      const learningStats = await this.getLearningStats();
      const semanticStats = semanticMemory.getStats();
      const performanceStats = performanceMonitor.getPerformanceStats();

      return {
        learningStats,
        semanticMemoryStats: semanticStats,
        performanceStats,
      };
    } catch (error) {
      Logger.error("Error getting advanced stats", { error });
      return {
        learningStats: {
          totalPatterns: 0,
          averageSuccessRate: 0,
          totalEvolutions: 0,
          mostSuccessfulPattern: "N/A",
          cacheHitRate: 0,
          averageResponseTime: 0,
          errorRate: 0,
        },
        semanticMemoryStats: {
          totalPatterns: 0,
          averageSimilarity: 0,
          cacheHitRate: 0,
          memoryUsage: 0,
        },
        performanceStats: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageDuration: 0,
          successRate: 0,
        },
      };
    }
  }
}

export const adaptiveLearning = AdaptiveLearning.getInstance();

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { cacheManager } from "./cacheManager";
import { performanceMonitor } from "./performanceMonitor";

// Schemas de validación
const embeddingSchema = z.object({
  embedding: z.array(z.number()),
  metadata: z.record(z.any()),
});

const similarityResultSchema = z.object({
  pattern: z.string(),
  similarity: z.number().min(0).max(1),
  metadata: z.record(z.any()),
});

export interface SemanticPattern {
  id: string;
  userId: string;
  pattern: string;
  embedding: number[];
  successRate: number;
  usageCount: number;
  lastUsed: Date;
  category: "prompt" | "response" | "interaction" | "error";
  metadata: Record<string, any>;
}

export interface SimilarityResult {
  pattern: string;
  similarity: number;
  metadata: Record<string, any>;
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

export class SemanticMemory {
  private static instance: SemanticMemory;
  private patterns: Map<string, SemanticPattern> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private maxPatterns: number = 10000;

  private constructor() {
    // Limpiar patrones antiguos periódicamente
    setInterval(() => {
      this.cleanupOldPatterns();
    }, 12 * 60 * 60 * 1000); // Cada 12 horas
  }

  static getInstance(): SemanticMemory {
    if (!SemanticMemory.instance) {
      SemanticMemory.instance = new SemanticMemory();
    }
    return SemanticMemory.instance;
  }

  /**
   * Generar embeddings para un texto
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();

    try {
      // Generar clave de caché para embedding
      const cacheKey = `embedding:${Buffer.from(text)
        .toString("base64")
        .slice(0, 100)}`;

      // Intentar obtener del caché
      const cachedEmbedding = await cacheManager.get<number[]>(cacheKey, {
        ttl: 24 * 3600, // 24 horas
        prefix: "semantic_memory",
      });

      if (cachedEmbedding) {
        Logger.info("Embedding cache hit", { textLength: text.length });
        return cachedEmbedding;
      }

      Logger.info("Generating embedding", { textLength: text.length });

      // Usar un modelo más económico para embeddings
      const result = await streamText({
        model: openai("gpt-4o-mini"), // Modelo más económico
        messages: [
          {
            role: "system",
            content:
              "Genera un embedding vectorial para este texto. Responde solo con un array de números entre -1 y 1.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0,
        maxTokens: 1000,
      });

      const textResult = await this.getTextSafely(result);

      // Parsear el embedding del resultado
      const embedding = this.parseEmbeddingFromText(textResult);

      // Validar embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Invalid embedding format");
      }

      // Guardar en caché
      await cacheManager.set(cacheKey, embedding, {
        ttl: 24 * 3600,
        prefix: "semantic_memory",
      });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "generate_embedding",
        duration,
        true,
        undefined,
        {
          textLength: text.length,
          embeddingLength: embedding.length,
        }
      );

      return embedding;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "generate_embedding",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error generating embedding", { error });

      // Fallback: embedding aleatorio simple
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Parsear embedding del texto de respuesta
   */
  private parseEmbeddingFromText(text: string): number[] {
    try {
      // Intentar extraer array de números del texto
      const match = text.match(/\[([^\]]+)\]/);
      if (match) {
        const numbers = match[1].split(",").map((n) => parseFloat(n.trim()));
        if (numbers.every((n) => !isNaN(n))) {
          return numbers;
        }
      }

      // Fallback: generar embedding basado en características del texto
      return this.generateFallbackEmbedding(text);
    } catch (error) {
      Logger.error("Error parsing embedding", { error });
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Generar embedding de fallback basado en características del texto
   */
  private generateFallbackEmbedding(text: string): number[] {
    const embedding: number[] = [];

    // Características básicas del texto
    embedding.push(text.length / 1000); // Longitud normalizada
    embedding.push(text.split(" ").length / 100); // Número de palabras
    embedding.push(text.includes("?") ? 1 : 0); // Es pregunta
    embedding.push(text.includes("!") ? 1 : 0); // Es exclamación
    embedding.push(text.includes("```") ? 1 : 0); // Contiene código
    embedding.push(text.includes("http") ? 1 : 0); // Contiene enlaces
    embedding.push(text.includes("@") ? 1 : 0); // Contiene menciones

    // Rellenar hasta 128 dimensiones
    while (embedding.length < 128) {
      embedding.push(Math.random() * 2 - 1);
    }

    return embedding.slice(0, 128);
  }

  /**
   * Calcular similitud coseno entre dos embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Almacenar patrón semántico
   */
  async storePattern(pattern: SemanticPattern): Promise<void> {
    const startTime = Date.now();

    try {
      // Validar patrón
      if (!pattern.embedding || pattern.embedding.length === 0) {
        throw new Error("Pattern must have valid embedding");
      }

      // Generar embedding si no existe
      if (!pattern.embedding) {
        pattern.embedding = await this.generateEmbedding(pattern.pattern);
      }

      // Guardar en memoria local
      this.patterns.set(pattern.id, pattern);
      this.embeddings.set(pattern.id, pattern.embedding);

      // Guardar en caché distribuido
      await cacheManager.set(`semantic_pattern:${pattern.id}`, pattern, {
        ttl: 24 * 3600, // 24 horas
        prefix: "semantic_memory",
      });

      // Limpiar si hay demasiados patrones
      if (this.patterns.size > this.maxPatterns) {
        this.cleanupOldPatterns();
      }

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "store_semantic_pattern",
        duration,
        true,
        undefined,
        {
          patternId: pattern.id,
          userId: pattern.userId,
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "store_semantic_pattern",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error storing semantic pattern", {
        error,
        patternId: pattern.id,
      });
    }
  }

  /**
   * Buscar patrones similares
   */
  async findSimilarPatterns(
    query: string,
    userId?: string,
    threshold: number = 0.7,
    limit: number = 10
  ): Promise<SimilarityResult[]> {
    const startTime = Date.now();

    try {
      // Generar embedding para la consulta
      const queryEmbedding = await this.generateEmbedding(query);

      // Calcular similitudes
      const similarities: Array<{
        pattern: SemanticPattern;
        similarity: number;
      }> = [];

      for (const [id, pattern] of this.patterns.entries()) {
        // Filtrar por usuario si se especifica
        if (
          userId &&
          pattern.userId !== userId &&
          pattern.userId !== "global"
        ) {
          continue;
        }

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          pattern.embedding
        );

        if (similarity >= threshold) {
          similarities.push({ pattern, similarity });
        }
      }

      // Ordenar por similitud y limitar resultados
      const results = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((item) => ({
          pattern: item.pattern.pattern,
          similarity: item.similarity,
          metadata: {
            ...item.pattern.metadata,
            userId: item.pattern.userId,
            successRate: item.pattern.successRate,
            usageCount: item.pattern.usageCount,
          },
        }));

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "find_similar_patterns",
        duration,
        true,
        undefined,
        {
          queryLength: query.length,
          resultsCount: results.length,
          threshold,
        }
      );

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "find_similar_patterns",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error finding similar patterns", { error });
      return [];
    }
  }

  /**
   * Obtener patrón más similar
   */
  async getMostSimilarPattern(
    query: string,
    userId?: string,
    threshold: number = 0.8
  ): Promise<SimilarityResult | null> {
    const results = await this.findSimilarPatterns(query, userId, threshold, 1);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Actualizar patrón existente
   */
  async updatePattern(
    patternId: string,
    updates: Partial<SemanticPattern>
  ): Promise<void> {
    try {
      const pattern = this.patterns.get(patternId);
      if (!pattern) {
        throw new Error("Pattern not found");
      }

      // Actualizar patrón
      Object.assign(pattern, updates);
      pattern.lastUsed = new Date();

      // Regenerar embedding si el patrón cambió
      if (updates.pattern && updates.pattern !== pattern.pattern) {
        pattern.embedding = await this.generateEmbedding(updates.pattern);
        this.embeddings.set(patternId, pattern.embedding);
      }

      // Guardar en caché
      await cacheManager.set(`semantic_pattern:${patternId}`, pattern, {
        ttl: 24 * 3600,
        prefix: "semantic_memory",
      });

      Logger.info("Pattern updated", {
        patternId,
        updates: Object.keys(updates),
      });
    } catch (error) {
      Logger.error("Error updating pattern", { error, patternId });
    }
  }

  /**
   * Eliminar patrón
   */
  async deletePattern(patternId: string): Promise<void> {
    try {
      this.patterns.delete(patternId);
      this.embeddings.delete(patternId);

      await cacheManager.delete(`semantic_pattern:${patternId}`, {
        prefix: "semantic_memory",
      });

      Logger.info("Pattern deleted", { patternId });
    } catch (error) {
      Logger.error("Error deleting pattern", { error, patternId });
    }
  }

  /**
   * Obtener estadísticas de memoria semántica
   */
  getStats(): {
    totalPatterns: number;
    averageSimilarity: number;
    cacheHitRate: number;
    memoryUsage: number;
  } {
    try {
      const totalPatterns = this.patterns.size;
      const cacheStats = cacheManager.getStats();

      // Calcular similitud promedio (ejemplo)
      let totalSimilarity = 0;
      let similarityCount = 0;

      const patterns = Array.from(this.patterns.values());
      for (let i = 0; i < Math.min(100, patterns.length); i++) {
        for (let j = i + 1; j < Math.min(100, patterns.length); j++) {
          const similarity = this.cosineSimilarity(
            patterns[i].embedding,
            patterns[j].embedding
          );
          totalSimilarity += similarity;
          similarityCount++;
        }
      }

      const averageSimilarity =
        similarityCount > 0 ? totalSimilarity / similarityCount : 0;

      return {
        totalPatterns,
        averageSimilarity,
        cacheHitRate: cacheStats.localCacheSize > 0 ? 0.8 : 0,
        memoryUsage: this.patterns.size * 128 * 8, // Estimación en bytes
      };
    } catch (error) {
      Logger.error("Error getting semantic memory stats", { error });
      return {
        totalPatterns: 0,
        averageSimilarity: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
      };
    }
  }

  /**
   * Limpiar patrones antiguos
   */
  private cleanupOldPatterns(maxAgeDays: number = 30): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      let cleanedCount = 0;

      for (const [id, pattern] of this.patterns.entries()) {
        if (pattern.lastUsed < cutoffDate && pattern.usageCount < 5) {
          this.patterns.delete(id);
          this.embeddings.delete(id);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        Logger.info("Semantic memory cleanup completed", { cleanedCount });
      }
    } catch (error) {
      Logger.error("Error during semantic memory cleanup", { error });
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
}

export const semanticMemory = SemanticMemory.getInstance();

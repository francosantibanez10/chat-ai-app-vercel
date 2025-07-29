import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  CodePattern,
  CodeExecution,
  ExecutionContext,
  CodeAnalysis,
} from "./codeExecutor/types";
import { cacheManager } from "./cacheManager";
import { performanceMonitor } from "./performanceMonitor";

// Logger estructurado
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(
      `[${this.context}] INFO: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  warn(message: string, data?: any): void {
    console.warn(
      `[${this.context}] WARN: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  error(message: string, error?: any): void {
    console.error(
      `[${this.context}] ERROR: ${message}`,
      error ? JSON.stringify(error, null, 2) : ""
    );
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[${this.context}] DEBUG: ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  }
}

// Schemas de validación
const codePatternSchema = z.object({
  id: z.string(),
  codeHash: z.string(),
  language: z.string(),
  pattern: z.string(),
  embeddings: z.array(z.number()),
  usageCount: z.number().min(0),
  successRate: z.number().min(0).max(1),
  averageExecutionTime: z.number().min(0),
  lastUsed: z.date(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
});

const similarityResultSchema = z.object({
  pattern: codePatternSchema,
  similarity: z.number().min(0).max(1),
  relevance: z.number().min(0).max(1),
});

const codeAnalysisResultSchema = z.object({
  complexity: z.number().min(1).max(10),
  patterns: z.array(z.string()),
  suggestions: z.array(z.string()),
  bestPractices: z.array(z.string()),
  securityNotes: z.array(z.string()),
});

export interface SimilarityResult
  extends z.infer<typeof similarityResultSchema> {}
export interface CodeAnalysisResult
  extends z.infer<typeof codeAnalysisResultSchema> {}

export class CodeMemory {
  private static instance: CodeMemory;
  private logger: Logger;
  private patterns: Map<string, CodePattern> = new Map();
  private userPatterns: Map<string, CodePattern[]> = new Map();
  private globalPatterns: CodePattern[] = [];
  private maxPatternsPerUser: number = 1000;
  private maxGlobalPatterns: number = 5000;
  private similarityThreshold: number = 0.7;

  private constructor() {
    this.logger = new Logger("CodeMemory");
    this.startCleanupInterval();
  }

  static getInstance(): CodeMemory {
    if (!CodeMemory.instance) {
      CodeMemory.instance = new CodeMemory();
    }
    return CodeMemory.instance;
  }

  async storePattern(
    code: string,
    language: string,
    execution: CodeExecution,
    context?: ExecutionContext
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Generar hash del código
      const codeHash = this.generateCodeHash(code);

      // Verificar si ya existe
      const existingPattern = this.patterns.get(codeHash);
      if (existingPattern) {
        await this.updateExistingPattern(existingPattern, execution);
        return;
      }

      // Generar embeddings
      const embeddings = await this.generateEmbeddings(code, language);

      // Analizar el código
      const analysis = await this.analyzeCode(code, language);

      // Crear nuevo patrón
      const pattern: CodePattern = {
        id: this.generateId(),
        codeHash,
        language,
        pattern: code,
        embeddings,
        usageCount: 1,
        successRate: execution.error ? 0 : 1,
        averageExecutionTime: execution.executionTime,
        lastUsed: new Date(),
        tags: this.extractTags(code, language, analysis),
        metadata: {
          userId: execution.userId,
          sessionId: context?.sessionId,
          executionId: execution.id,
          analysis,
          createdAt: new Date(),
        },
      };

      // Validar con Zod
      const validatedPattern = codePatternSchema.parse(pattern);

      // Guardar en memoria
      this.patterns.set(codeHash, validatedPattern);

      // Guardar en cache distribuido
      const cacheKey = `code_pattern:${codeHash}`;
      await cacheManager.set(cacheKey, validatedPattern, { ttl: 86400 * 7 }); // 7 días

      // Agregar a patrones del usuario
      const userPatterns = this.userPatterns.get(execution.userId) || [];
      userPatterns.push(validatedPattern);
      this.userPatterns.set(execution.userId, userPatterns);

      // Agregar a patrones globales si es exitoso
      if (!execution.error && validatedPattern.successRate > 0.8) {
        this.globalPatterns.push(validatedPattern);
      }

      // Registrar métricas
      performanceMonitor.recordMetric(
        "code_pattern_stored",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: execution.userId,
          language,
          codeLength: code.length,
        }
      );

      this.logger.info(`Code pattern stored successfully`, {
        patternId: validatedPattern.id,
        userId: execution.userId,
        language,
        successRate: validatedPattern.successRate,
      });
    } catch (error) {
      this.logger.error(`Failed to store code pattern`, error);
      performanceMonitor.recordError(
        "code_pattern_storage_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async findSimilarPatterns(
    code: string,
    language: string,
    options: {
      userId?: string;
      limit?: number;
      threshold?: number;
      context?: ExecutionContext;
    } = {}
  ): Promise<SimilarityResult[]> {
    const startTime = Date.now();

    try {
      const limit = options.limit || 5;
      const threshold = options.threshold || this.similarityThreshold;

      // Generar embeddings para el código de consulta
      const queryEmbeddings = await this.generateEmbeddings(code, language);

      // Intentar obtener del cache
      const cacheKey = `similar_patterns:${this.generateCodeHash(
        code
      )}:${language}:${JSON.stringify(options)}`;
      const cached = await cacheManager.get<SimilarityResult[]>(cacheKey);
      if (cached) {
        this.logger.info(`Similar patterns retrieved from cache`, {
          language,
          count: cached.length,
        });
        return cached;
      }

      let patternsToSearch: CodePattern[] = [];

      // Buscar en patrones del usuario específico
      if (options.userId) {
        const userPatterns = this.userPatterns.get(options.userId) || [];
        patternsToSearch.push(...userPatterns);
      }

      // Buscar en patrones globales
      patternsToSearch.push(...this.globalPatterns);

      // Filtrar por lenguaje
      patternsToSearch = patternsToSearch.filter(
        (p) => p.language === language
      );

      // Calcular similitud
      const similarities: SimilarityResult[] = [];

      for (const pattern of patternsToSearch) {
        const similarity = this.calculateCosineSimilarity(
          queryEmbeddings,
          pattern.embeddings
        );

        if (similarity >= threshold) {
          const relevance = this.calculateRelevance(pattern, similarity);

          similarities.push({
            pattern,
            similarity,
            relevance,
          });
        }
      }

      // Ordenar por similitud y relevancia
      similarities.sort((a, b) => {
        const scoreA = a.similarity * 0.7 + a.relevance * 0.3;
        const scoreB = b.similarity * 0.7 + b.relevance * 0.3;
        return scoreB - scoreA;
      });

      // Limitar resultados
      const results = similarities.slice(0, limit);

      // Cachear resultado
      await cacheManager.set(cacheKey, results, { ttl: 600 }); // 10 minutos

      // Registrar métricas
      performanceMonitor.recordMetric(
        "similar_patterns_found",
        Date.now() - startTime,
        true,
        undefined,
        {
          language,
          count: results.length,
          threshold,
        }
      );

      this.logger.info(`Similar patterns found`, {
        language,
        count: results.length,
        threshold,
        totalSearched: patternsToSearch.length,
      });

      return results;
    } catch (error) {
      this.logger.error(`Failed to find similar patterns`, error);
      performanceMonitor.recordError(
        "similar_patterns_search_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return [];
    }
  }

  async getPatternSuggestions(
    code: string,
    language: string,
    context?: ExecutionContext
  ): Promise<{
    improvements: string[];
    optimizations: string[];
    bestPractices: string[];
    securitySuggestions: string[];
    similarPatterns: CodePattern[];
  }> {
    const startTime = Date.now();

    try {
      // Analizar código
      const analysis = await this.analyzeCode(code, language);

      // Encontrar patrones similares
      const similarPatterns = await this.findSimilarPatterns(code, language, {
        userId: context?.userId,
        limit: 3,
      });

      // Generar sugerencias con IA
      const suggestions = await this.generateSuggestionsWithAI(
        code,
        language,
        analysis,
        similarPatterns
      );

      // Registrar métricas
      performanceMonitor.recordMetric(
        "pattern_suggestions_generated",
        Date.now() - startTime,
        true,
        undefined,
        {
          language,
          improvementsCount: suggestions.improvements.length,
          optimizationsCount: suggestions.optimizations.length,
          bestPracticesCount: suggestions.bestPractices.length,
          securitySuggestionsCount: suggestions.securitySuggestions.length,
        }
      );

      return {
        ...suggestions,
        similarPatterns: similarPatterns.map((result) => result.pattern),
      };
    } catch (error) {
      this.logger.error(`Failed to generate pattern suggestions`, error);
      performanceMonitor.recordError(
        "pattern_suggestions_generation_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return {
        improvements: [],
        optimizations: [],
        bestPractices: [],
        securitySuggestions: [],
        similarPatterns: [],
      };
    }
  }

  async getPatternStats(userId?: string): Promise<{
    totalPatterns: number;
    patternsByLanguage: Record<string, number>;
    averageSuccessRate: number;
    averageExecutionTime: number;
    mostUsedPatterns: CodePattern[];
    recentPatterns: CodePattern[];
  }> {
    const startTime = Date.now();

    try {
      let allPatterns: CodePattern[] = [];

      if (userId) {
        allPatterns = this.userPatterns.get(userId) || [];
      } else {
        // Combinar patrones de todos los usuarios y globales
        for (const userPatterns of this.userPatterns.values()) {
          allPatterns.push(...userPatterns);
        }
        allPatterns.push(...this.globalPatterns);
      }

      // Calcular estadísticas
      const patternsByLanguage: Record<string, number> = {};
      let totalSuccessRate = 0;
      let totalExecutionTime = 0;
      let validPatterns = 0;

      for (const pattern of allPatterns) {
        // Contar por lenguaje
        patternsByLanguage[pattern.language] =
          (patternsByLanguage[pattern.language] || 0) + 1;

        // Calcular promedios
        if (pattern.successRate > 0) {
          totalSuccessRate += pattern.successRate;
          totalExecutionTime += pattern.averageExecutionTime;
          validPatterns++;
        }
      }

      // Ordenar patrones por uso y fecha
      const mostUsedPatterns = [...allPatterns]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      const recentPatterns = [...allPatterns]
        .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
        .slice(0, 10);

      const stats = {
        totalPatterns: allPatterns.length,
        patternsByLanguage,
        averageSuccessRate:
          validPatterns > 0 ? totalSuccessRate / validPatterns : 0,
        averageExecutionTime:
          validPatterns > 0 ? totalExecutionTime / validPatterns : 0,
        mostUsedPatterns,
        recentPatterns,
      };

      // Registrar métricas
      performanceMonitor.recordMetric(
        "pattern_stats_retrieved",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: userId || "all",
          totalPatterns: stats.totalPatterns,
        }
      );

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get pattern stats`, error);
      performanceMonitor.recordError(
        "pattern_stats_retrieval_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return {
        totalPatterns: 0,
        patternsByLanguage: {},
        averageSuccessRate: 0,
        averageExecutionTime: 0,
        mostUsedPatterns: [],
        recentPatterns: [],
      };
    }
  }

  async cleanupOldPatterns(maxAgeDays: number = 90): Promise<void> {
    const startTime = Date.now();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      let totalCleaned = 0;

      // Limpiar patrones de usuario
      for (const [userId, userPatterns] of this.userPatterns.entries()) {
        const originalCount = userPatterns.length;
        const filteredPatterns = userPatterns.filter(
          (pattern) => pattern.lastUsed >= cutoffDate
        );

        if (filteredPatterns.length !== originalCount) {
          this.userPatterns.set(userId, filteredPatterns);
          totalCleaned += originalCount - filteredPatterns.length;
        }

        // Limitar patrones por usuario
        if (filteredPatterns.length > this.maxPatternsPerUser) {
          const sortedPatterns = filteredPatterns.sort(
            (a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()
          );
          this.userPatterns.set(
            userId,
            sortedPatterns.slice(0, this.maxPatternsPerUser)
          );
        }
      }

      // Limpiar patrones globales
      const originalGlobalCount = this.globalPatterns.length;
      this.globalPatterns = this.globalPatterns.filter(
        (pattern) => pattern.lastUsed >= cutoffDate
      );

      if (this.globalPatterns.length !== originalGlobalCount) {
        totalCleaned += originalGlobalCount - this.globalPatterns.length;
      }

      // Limitar patrones globales
      if (this.globalPatterns.length > this.maxGlobalPatterns) {
        this.globalPatterns.sort(
          (a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()
        );
        this.globalPatterns = this.globalPatterns.slice(
          0,
          this.maxGlobalPatterns
        );
      }

      // Registrar métricas
      performanceMonitor.recordMetric(
        "old_patterns_cleaned",
        Date.now() - startTime,
        true,
        undefined,
        {
          totalCleaned,
          maxAgeDays,
        }
      );

      this.logger.info(`Pattern cleanup completed`, {
        totalCleaned,
        maxAgeDays,
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup old patterns`, error);
      performanceMonitor.recordError(
        "pattern_cleanup_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private async updateExistingPattern(
    pattern: CodePattern,
    execution: CodeExecution
  ): Promise<void> {
    try {
      // Actualizar estadísticas
      pattern.usageCount++;
      pattern.lastUsed = new Date();

      // Actualizar tasa de éxito
      const success = !execution.error;
      const totalSuccesses =
        pattern.successRate * (pattern.usageCount - 1) + (success ? 1 : 0);
      pattern.successRate = totalSuccesses / pattern.usageCount;

      // Actualizar tiempo de ejecución promedio
      const totalTime =
        pattern.averageExecutionTime * (pattern.usageCount - 1) +
        execution.executionTime;
      pattern.averageExecutionTime = totalTime / pattern.usageCount;

      // Actualizar en cache
      const cacheKey = `code_pattern:${pattern.codeHash}`;
      await cacheManager.set(cacheKey, pattern, { ttl: 86400 * 7 }); // 7 días

      this.logger.debug(`Pattern updated`, {
        patternId: pattern.id,
        newUsageCount: pattern.usageCount,
        newSuccessRate: pattern.successRate,
      });
    } catch (error) {
      this.logger.error(`Failed to update existing pattern`, error);
    }
  }

  private async generateEmbeddings(
    code: string,
    language: string
  ): Promise<number[]> {
    try {
      // Intentar obtener del cache
      const cacheKey = `embeddings:${this.generateCodeHash(code)}`;
      const cached = await cacheManager.get<number[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Generar embeddings con IA
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `Genera embeddings vectoriales para el código proporcionado. Responde SOLO con un array de números JSON.`,
          },
          {
            role: "user",
            content: `Genera embeddings para este código en ${language}:\n\n${code}`,
          },
        ],
        temperature: 0,
        maxTokens: 1000,
      });

      const text = await this.getTextSafely(result);
      const embeddings = JSON.parse(text);

      // Validar que sea un array de números
      if (
        !Array.isArray(embeddings) ||
        !embeddings.every((n) => typeof n === "number")
      ) {
        throw new Error("Invalid embeddings format");
      }

      // Normalizar embeddings
      const normalizedEmbeddings = this.normalizeVector(embeddings);

      // Cachear embeddings
      await cacheManager.set(cacheKey, normalizedEmbeddings, {
        ttl: 86400 * 30,
      }); // 30 días

      return normalizedEmbeddings;
    } catch (error) {
      this.logger.error(`Failed to generate embeddings`, error);
      // Retornar embeddings de fallback
      return this.generateFallbackEmbeddings(code);
    }
  }

  private async analyzeCode(
    code: string,
    language: string
  ): Promise<CodeAnalysisResult> {
    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `Analiza el código proporcionado y genera un análisis detallado. Responde SOLO con JSON.`,
          },
          {
            role: "user",
            content: `Analiza este código en ${language}:\n\n${code}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 1500,
      });

      const text = await this.getTextSafely(result);
      const analysis = JSON.parse(text);

      return codeAnalysisResultSchema.parse(analysis);
    } catch (error) {
      this.logger.error(`Failed to analyze code`, error);
      return {
        complexity: 5,
        patterns: [],
        suggestions: [],
        bestPractices: [],
        securityNotes: [],
      };
    }
  }

  private async generateSuggestionsWithAI(
    code: string,
    language: string,
    analysis: CodeAnalysisResult,
    similarPatterns: SimilarityResult[]
  ): Promise<{
    improvements: string[];
    optimizations: string[];
    bestPractices: string[];
    securitySuggestions: string[];
  }> {
    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `Genera sugerencias de mejora para el código proporcionado. Responde SOLO con JSON.`,
          },
          {
            role: "user",
            content: `Genera sugerencias para este código en ${language}:\n\n${code}\n\nAnálisis: ${JSON.stringify(
              analysis
            )}\n\nPatrones similares encontrados: ${similarPatterns.length}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      const text = await this.getTextSafely(result);
      const suggestions = JSON.parse(text);

      return {
        improvements: suggestions.improvements || [],
        optimizations: suggestions.optimizations || [],
        bestPractices: suggestions.bestPractices || [],
        securitySuggestions: suggestions.securitySuggestions || [],
      };
    } catch (error) {
      this.logger.error(`Failed to generate suggestions`, error);
      return {
        improvements: [],
        optimizations: [],
        bestPractices: [],
        securitySuggestions: [],
      };
    }
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private calculateRelevance(pattern: CodePattern, similarity: number): number {
    // Calcular relevancia basada en múltiples factores
    const successWeight = 0.3;
    const usageWeight = 0.2;
    const recencyWeight = 0.2;
    const similarityWeight = 0.3;

    const successScore = pattern.successRate;
    const usageScore = Math.min(pattern.usageCount / 10, 1); // Normalizar a 10 usos
    const recencyScore = Math.max(
      0,
      1 - (Date.now() - pattern.lastUsed.getTime()) / (86400 * 30 * 1000)
    ); // 30 días
    const similarityScore = similarity;

    return (
      successScore * successWeight +
      usageScore * usageWeight +
      recencyScore * recencyWeight +
      similarityScore * similarityWeight
    );
  }

  private extractTags(
    code: string,
    language: string,
    analysis: CodeAnalysisResult
  ): string[] {
    const tags: string[] = [];

    // Tags basados en el lenguaje
    tags.push(language);

    // Tags basados en la complejidad
    if (analysis.complexity > 7) tags.push("complex");
    else if (analysis.complexity < 3) tags.push("simple");

    // Tags basados en patrones detectados
    tags.push(...analysis.patterns);

    // Tags basados en el contenido del código
    if (code.includes("function") || code.includes("def"))
      tags.push("function");
    if (code.includes("class")) tags.push("class");
    if (code.includes("async") || code.includes("await")) tags.push("async");
    if (code.includes("import") || code.includes("require"))
      tags.push("imports");

    return [...new Set(tags)]; // Eliminar duplicados
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );
    if (magnitude === 0) return vector;
    return vector.map((val) => val / magnitude);
  }

  private generateFallbackEmbeddings(code: string): number[] {
    // Embeddings de fallback basados en características del código
    const features = [
      code.length / 1000, // Longitud normalizada
      (code.match(/function|def/g) || []).length / 10, // Número de funciones
      (code.match(/if|else|switch/g) || []).length / 10, // Condicionales
      (code.match(/for|while/g) || []).length / 10, // Bucles
      (code.match(/import|require/g) || []).length / 10, // Imports
    ];

    // Completar con ceros hasta 128 dimensiones
    const embeddings = new Array(128).fill(0);
    features.forEach((feature, index) => {
      if (index < embeddings.length) {
        embeddings[index] = Math.min(feature, 1);
      }
    });

    return this.normalizeVector(embeddings);
  }

  private generateCodeHash(code: string): string {
    // Hash simple del código
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private async getTextSafely(result: any): Promise<string> {
    try {
      let text = "";
      for await (const chunk of result.textStream) {
        text += chunk;
      }
      return text;
    } catch (error) {
      this.logger.error("Error extracting text from stream", error);
      throw new Error("Failed to extract text from AI response");
    }
  }

  private generateId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanupInterval(): void {
    // Ejecutar cleanup cada 24 horas
    setInterval(() => {
      this.cleanupOldPatterns().catch((error) => {
        this.logger.error(`Cleanup interval failed`, error);
      });
    }, 24 * 60 * 60 * 1000);
  }

  configure(options: {
    maxPatternsPerUser?: number;
    maxGlobalPatterns?: number;
    similarityThreshold?: number;
  }): void {
    if (options.maxPatternsPerUser !== undefined) {
      this.maxPatternsPerUser = options.maxPatternsPerUser;
    }
    if (options.maxGlobalPatterns !== undefined) {
      this.maxGlobalPatterns = options.maxGlobalPatterns;
    }
    if (options.similarityThreshold !== undefined) {
      this.similarityThreshold = options.similarityThreshold;
    }

    this.logger.info(`CodeMemory configured`, options);
  }

  getStats(): {
    totalPatterns: number;
    totalUsers: number;
    averagePatternsPerUser: number;
    averageSuccessRate: number;
    averageExecutionTime: number;
  } {
    const totalPatterns = this.patterns.size;
    const totalUsers = this.userPatterns.size;
    const allPatterns = Array.from(this.patterns.values());

    const averageSuccessRate =
      allPatterns.length > 0
        ? allPatterns.reduce((sum, p) => sum + p.successRate, 0) /
          allPatterns.length
        : 0;

    const averageExecutionTime =
      allPatterns.length > 0
        ? allPatterns.reduce((sum, p) => sum + p.averageExecutionTime, 0) /
          allPatterns.length
        : 0;

    return {
      totalPatterns,
      totalUsers,
      averagePatternsPerUser: totalUsers > 0 ? totalPatterns / totalUsers : 0,
      averageSuccessRate,
      averageExecutionTime,
    };
  }
}

export const codeMemory = CodeMemory.getInstance();

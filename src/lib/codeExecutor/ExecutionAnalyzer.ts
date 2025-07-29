import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  CodeAnalysis,
  PerformanceReport,
  DebugResult,
  ExecutionContext,
  codeAnalysisSchema,
  performanceReportSchema,
  debugResultSchema,
} from "./types";
import { cacheManager } from "../cacheManager";
import { performanceMonitor } from "../performanceMonitor";

// Logger estructurado
class Logger {
  static info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        component: "ExecutionAnalyzer",
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
        component: "ExecutionAnalyzer",
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
        component: "ExecutionAnalyzer",
        message,
        ...data,
      })
    );
  }
}

export class ExecutionAnalyzer {
  private static instance: ExecutionAnalyzer;

  private constructor() {}

  static getInstance(): ExecutionAnalyzer {
    if (!ExecutionAnalyzer.instance) {
      ExecutionAnalyzer.instance = new ExecutionAnalyzer();
    }
    return ExecutionAnalyzer.instance;
  }

  /**
   * Analizar código con IA avanzada
   */
  async analyzeCode(
    code: string,
    language: string,
    context?: ExecutionContext
  ): Promise<CodeAnalysis> {
    const startTime = Date.now();
    const cacheKey = `code_analysis:${language}:${this.hashCode(code)}`;

    try {
      // Verificar caché
      const cached = await cacheManager.get<CodeAnalysis>(cacheKey, {
        prefix: "analysis",
        ttl: 3600, // 1 hora
      });

      if (cached) {
        Logger.info("Code analysis found in cache", {
          language,
          codeHash: this.hashCode(code),
        });
        return cached;
      }

      // Análisis estático
      const staticAnalysis = this.performStaticAnalysis(code, language);

      // Análisis con IA
      const aiAnalysis = await this.performAIAnalysis(code, language);

      // Combinar análisis
      const combinedAnalysis = this.combineAnalysis(staticAnalysis, aiAnalysis);

      // Validar resultado
      const validatedAnalysis = codeAnalysisSchema.parse(combinedAnalysis);

      // Guardar en caché
      await cacheManager.set(cacheKey, validatedAnalysis, {
        prefix: "analysis",
        ttl: 3600,
      });

      // Registrar métricas
      performanceMonitor.recordMetric("code_analysis", {
        language,
        duration: Date.now() - startTime,
        complexity: validatedAnalysis.complexity,
        securityScore: validatedAnalysis.securityScore,
        performanceScore: validatedAnalysis.performanceScore,
        userId: context?.userId,
      });

      Logger.info("Code analysis completed", {
        language,
        complexity: validatedAnalysis.complexity,
        securityScore: validatedAnalysis.securityScore,
        performanceScore: validatedAnalysis.performanceScore,
      });

      return validatedAnalysis;
    } catch (error) {
      Logger.error("Error in code analysis", {
        error,
        language,
        codeLength: code.length,
      });

      // Análisis de fallback
      return {
        language,
        complexity: 1,
        potentialIssues: ["Error en análisis de código"],
        suggestions: ["Revisar código manualmente"],
        securityScore: 0.5,
        performanceScore: 0.5,
      };
    }
  }

  /**
   * Analizar rendimiento de ejecución
   */
  async analyzePerformance(
    execution: any,
    context?: ExecutionContext
  ): Promise<PerformanceReport> {
    const startTime = Date.now();

    try {
      // Análisis básico de rendimiento
      const performanceAnalysis = this.performPerformanceAnalysis(execution);

      // Análisis con IA para optimizaciones
      const aiOptimizations = await this.performAIPerformanceAnalysis(
        execution
      );

      // Combinar análisis
      const combinedAnalysis = this.combinePerformanceAnalysis(
        performanceAnalysis,
        aiOptimizations
      );

      // Validar resultado
      const validatedReport = performanceReportSchema.parse(combinedAnalysis);

      // Registrar métricas
      performanceMonitor.recordMetric("performance_analysis", {
        language: execution.language,
        duration: Date.now() - startTime,
        executionTime: execution.executionTime,
        memoryUsage: execution.memoryUsage,
        userId: context?.userId,
      });

      Logger.info("Performance analysis completed", {
        executionId: execution.id,
        executionTime: execution.executionTime,
        memoryUsage: execution.memoryUsage,
        performanceScore: validatedReport.performanceScore,
      });

      return validatedReport;
    } catch (error) {
      Logger.error("Error in performance analysis", {
        error,
        executionId: execution.id,
      });

      return {
        executionTime: execution.executionTime || 0,
        memoryUsage: execution.memoryUsage || 0,
        complexity: 1,
        performanceScore: 0.5,
      };
    }
  }

  /**
   * Depurar código automáticamente
   */
  async debugCode(
    code: string,
    language: string,
    error: string,
    input?: any,
    context?: ExecutionContext
  ): Promise<DebugResult> {
    const startTime = Date.now();
    const cacheKey = `debug_result:${language}:${this.hashCode(
      code
    )}:${this.hashCode(error)}`;

    try {
      // Verificar caché
      const cached = await cacheManager.get<DebugResult>(cacheKey, {
        prefix: "debug",
        ttl: 1800, // 30 minutos
      });

      if (cached) {
        Logger.info("Debug result found in cache", {
          language,
          codeHash: this.hashCode(code),
        });
        return cached;
      }

      // Análisis del error
      const errorAnalysis = this.analyzeError(error, language);

      // Depuración con IA
      const aiDebugResult = await this.performAIDebugging(
        code,
        language,
        error,
        input
      );

      // Combinar resultados
      const combinedResult = this.combineDebugResults(
        errorAnalysis,
        aiDebugResult
      );

      // Validar resultado
      const validatedResult = debugResultSchema.parse(combinedResult);

      // Guardar en caché
      await cacheManager.set(cacheKey, validatedResult, {
        prefix: "debug",
        ttl: 1800,
      });

      // Registrar métricas
      performanceMonitor.recordMetric("code_debugging", {
        language,
        duration: Date.now() - startTime,
        success: validatedResult.confidence > 0.5,
        confidence: validatedResult.confidence,
        userId: context?.userId,
      });

      Logger.info("Code debugging completed", {
        language,
        confidence: validatedResult.confidence,
        originalError: error,
      });

      return validatedResult;
    } catch (error) {
      Logger.error("Error in code debugging", {
        error,
        language,
        originalError: error,
      });

      return {
        fixedCode: code,
        explanation: "Error en depuración automática",
        confidence: 0,
        originalError: error,
      };
    }
  }

  /**
   * Análisis estático de código
   */
  private performStaticAnalysis(
    code: string,
    language: string
  ): {
    complexity: number;
    cyclomaticComplexity: number;
    potentialIssues: string[];
    suggestions: string[];
    securityScore: number;
    performanceScore: number;
    maintainabilityScore: number;
    codeStyleScore: number;
  } {
    const lines = code.split("\n");
    const complexity = this.calculateComplexity(code, language);
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(
      code,
      language
    );

    const potentialIssues: string[] = [];
    const suggestions: string[] = [];

    // Análisis básico de calidad
    if (lines.length > 100) {
      potentialIssues.push("Código muy largo");
      suggestions.push("Considerar dividir en funciones más pequeñas");
    }

    if (complexity > 5) {
      potentialIssues.push("Complejidad alta");
      suggestions.push("Simplificar lógica");
    }

    if (cyclomaticComplexity > 10) {
      potentialIssues.push("Complejidad ciclomática alta");
      suggestions.push("Reducir número de ramas condicionales");
    }

    // Verificar indentación
    const indentationIssues = this.checkIndentation(lines);
    if (indentationIssues.length > 0) {
      potentialIssues.push(...indentationIssues);
      suggestions.push("Usar indentación consistente");
    }

    // Verificar longitud de líneas
    const longLines = lines.filter((line) => line.length > 80).length;
    if (longLines > 0) {
      potentialIssues.push(`${longLines} líneas muy largas`);
      suggestions.push("Mantener líneas bajo 80 caracteres");
    }

    // Calcular scores
    const securityScore = Math.max(0.5, 1 - potentialIssues.length * 0.1);
    const performanceScore = Math.max(0.5, 1 - complexity * 0.1);
    const maintainabilityScore = Math.max(0.5, 1 - cyclomaticComplexity * 0.05);
    const codeStyleScore = Math.max(0.5, 1 - indentationIssues.length * 0.1);

    return {
      complexity,
      cyclomaticComplexity,
      potentialIssues,
      suggestions,
      securityScore,
      performanceScore,
      maintainabilityScore,
      codeStyleScore,
    };
  }

  /**
   * Análisis de código con IA
   */
  private async performAIAnalysis(
    code: string,
    language: string
  ): Promise<{
    potentialIssues: string[];
    suggestions: string[];
    bestPractices: string[];
    refactoringSuggestions: string[];
    securityScore: number;
    performanceScore: number;
  }> {
    const analysisPrompt = `
Analiza el siguiente código y proporciona un análisis detallado:

Lenguaje: ${language}
Código:
\`\`\`${language}
${code}
\`\`\`

Proporciona:
1. Problemas potenciales identificados
2. Sugerencias de mejora
3. Mejores prácticas aplicables
4. Sugerencias de refactoring
5. Score de seguridad (0-1)
6. Score de rendimiento (0-1)

Responde SOLO con JSON válido:
{
  "potentialIssues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "bestPractices": ["practice1", "practice2"],
  "refactoringSuggestions": ["refactor1", "refactor2"],
  "securityScore": 0.8,
  "performanceScore": 0.7
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.1,
        maxTokens: 600,
      });

      const aiResult = JSON.parse(await this.getTextSafely(result));

      return {
        potentialIssues: aiResult.potentialIssues || [],
        suggestions: aiResult.suggestions || [],
        bestPractices: aiResult.bestPractices || [],
        refactoringSuggestions: aiResult.refactoringSuggestions || [],
        securityScore: aiResult.securityScore || 0.5,
        performanceScore: aiResult.performanceScore || 0.5,
      };
    } catch (error) {
      Logger.error("Error in AI code analysis", { error });
      return {
        potentialIssues: [],
        suggestions: [],
        bestPractices: [],
        refactoringSuggestions: [],
        securityScore: 0.5,
        performanceScore: 0.5,
      };
    }
  }

  /**
   * Análisis de rendimiento básico
   */
  private performPerformanceAnalysis(execution: any): {
    executionTime: number;
    memoryUsage: number;
    complexity: number;
    bottlenecks: string[];
    optimizations: string[];
    performanceScore: number;
  } {
    const executionTime = execution.executionTime || 0;
    const memoryUsage = execution.memoryUsage || 0;
    const complexity = execution.metadata?.complexity || 1;

    const bottlenecks: string[] = [];
    const optimizations: string[] = [];

    // Análisis de tiempo de ejecución
    if (executionTime > 1000) {
      bottlenecks.push("Tiempo de ejecución alto");
      optimizations.push("Optimizar algoritmos o usar caché");
    }

    if (executionTime > 5000) {
      bottlenecks.push("Tiempo de ejecución muy alto");
      optimizations.push("Considerar ejecución asíncrona o paralela");
    }

    // Análisis de uso de memoria
    if (memoryUsage > 100) {
      bottlenecks.push("Uso de memoria alto");
      optimizations.push("Optimizar gestión de memoria");
    }

    if (memoryUsage > 500) {
      bottlenecks.push("Uso de memoria muy alto");
      optimizations.push("Implementar garbage collection manual");
    }

    // Análisis de complejidad
    if (complexity > 5) {
      bottlenecks.push("Complejidad algorítmica alta");
      optimizations.push("Simplificar algoritmos");
    }

    // Calcular score de rendimiento
    const timeScore = Math.max(0, 1 - executionTime / 10000);
    const memoryScore = Math.max(0, 1 - memoryUsage / 1000);
    const complexityScore = Math.max(0, 1 - complexity / 10);

    const performanceScore = (timeScore + memoryScore + complexityScore) / 3;

    return {
      executionTime,
      memoryUsage,
      complexity,
      bottlenecks,
      optimizations,
      performanceScore,
    };
  }

  /**
   * Análisis de rendimiento con IA
   */
  private async performAIPerformanceAnalysis(execution: any): Promise<{
    bottlenecks: string[];
    optimizations: string[];
  }> {
    const analysisPrompt = `
Analiza el rendimiento de esta ejecución de código:

Lenguaje: ${execution.language}
Código:
\`\`\`${execution.language}
${execution.code}
\`\`\`

Métricas:
- Tiempo de ejecución: ${execution.executionTime}ms
- Uso de memoria: ${execution.memoryUsage}MB
- Complejidad: ${execution.metadata?.complexity || "N/A"}

Identifica:
1. Cuellos de botella específicos
2. Optimizaciones recomendadas

Responde SOLO con JSON válido:
{
  "bottlenecks": ["bottleneck1", "bottleneck2"],
  "optimizations": ["optimization1", "optimization2"]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.1,
        maxTokens: 400,
      });

      const aiResult = JSON.parse(await this.getTextSafely(result));

      return {
        bottlenecks: aiResult.bottlenecks || [],
        optimizations: aiResult.optimizations || [],
      };
    } catch (error) {
      Logger.error("Error in AI performance analysis", { error });
      return {
        bottlenecks: [],
        optimizations: [],
      };
    }
  }

  /**
   * Análisis de error
   */
  private analyzeError(
    error: string,
    language: string
  ): {
    errorType: string;
    severity: "low" | "medium" | "high" | "critical";
    commonCauses: string[];
    quickFixes: string[];
  } {
    const errorLower = error.toLowerCase();

    let errorType = "Unknown";
    let severity: "low" | "medium" | "high" | "critical" = "medium";
    let commonCauses: string[] = [];
    let quickFixes: string[] = [];

    // Análisis de errores comunes
    if (errorLower.includes("syntax")) {
      errorType = "Syntax Error";
      severity = "high";
      commonCauses = [
        "Paréntesis no balanceados",
        "Punto y coma faltante",
        "Comillas no cerradas",
      ];
      quickFixes = ["Verificar sintaxis", "Usar linter", "Revisar indentación"];
    } else if (errorLower.includes("reference")) {
      errorType = "Reference Error";
      severity = "medium";
      commonCauses = [
        "Variable no definida",
        "Función no encontrada",
        "Módulo no importado",
      ];
      quickFixes = [
        "Verificar nombres de variables",
        "Importar módulos necesarios",
        "Verificar scope",
      ];
    } else if (errorLower.includes("type")) {
      errorType = "Type Error";
      severity = "medium";
      commonCauses = [
        "Tipo de dato incorrecto",
        "Conversión de tipos fallida",
        "Método no disponible",
      ];
      quickFixes = [
        "Verificar tipos de datos",
        "Usar conversiones explícitas",
        "Verificar API",
      ];
    } else if (errorLower.includes("timeout")) {
      errorType = "Timeout Error";
      severity = "high";
      commonCauses = [
        "Bucle infinito",
        "Operación muy lenta",
        "Recursión excesiva",
      ];
      quickFixes = [
        "Verificar condiciones de salida",
        "Optimizar algoritmos",
        "Usar iteración",
      ];
    } else if (errorLower.includes("memory")) {
      errorType = "Memory Error";
      severity = "critical";
      commonCauses = [
        "Memory leak",
        "Estructura de datos muy grande",
        "Recursión sin límite",
      ];
      quickFixes = [
        "Liberar memoria",
        "Optimizar estructuras",
        "Limitar recursión",
      ];
    }

    return {
      errorType,
      severity,
      commonCauses,
      quickFixes,
    };
  }

  /**
   * Depuración con IA
   */
  private async performAIDebugging(
    code: string,
    language: string,
    error: string,
    input?: any
  ): Promise<{
    fixedCode: string;
    explanation: string;
    confidence: number;
    appliedFixes: string[];
    suggestions: string[];
  }> {
    const debugPrompt = `
Depura este código que está fallando:

Lenguaje: ${language}
Código:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}
Input: ${JSON.stringify(input)}

Proporciona:
1. Código corregido
2. Explicación del error y la corrección
3. Nivel de confianza (0-1)
4. Correcciones aplicadas
5. Sugerencias adicionales

Responde SOLO con JSON válido:
{
  "fixedCode": "código corregido",
  "explanation": "explicación detallada",
  "confidence": 0.9,
  "appliedFixes": ["fix1", "fix2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: debugPrompt }],
        temperature: 0.3,
        maxTokens: 1000,
      });

      const aiResult = JSON.parse(await this.getTextSafely(result));

      return {
        fixedCode: aiResult.fixedCode || code,
        explanation:
          aiResult.explanation || "No se pudo depurar automáticamente",
        confidence: aiResult.confidence || 0,
        appliedFixes: aiResult.appliedFixes || [],
        suggestions: aiResult.suggestions || [],
      };
    } catch (error) {
      Logger.error("Error in AI debugging", { error });
      return {
        fixedCode: code,
        explanation: "Error en depuración automática",
        confidence: 0,
        appliedFixes: [],
        suggestions: [],
      };
    }
  }

  /**
   * Métodos de utilidad
   */
  private combineAnalysis(staticAnalysis: any, aiAnalysis: any): CodeAnalysis {
    return {
      language: staticAnalysis.language || "unknown",
      complexity: staticAnalysis.complexity,
      cyclomaticComplexity: staticAnalysis.cyclomaticComplexity,
      potentialIssues: [
        ...staticAnalysis.potentialIssues,
        ...aiAnalysis.potentialIssues,
      ],
      suggestions: [...staticAnalysis.suggestions, ...aiAnalysis.suggestions],
      securityScore:
        (staticAnalysis.securityScore + aiAnalysis.securityScore) / 2,
      performanceScore:
        (staticAnalysis.performanceScore + aiAnalysis.performanceScore) / 2,
      maintainabilityScore: staticAnalysis.maintainabilityScore,
      codeStyleScore: staticAnalysis.codeStyleScore,
      bestPractices: aiAnalysis.bestPractices,
      refactoringSuggestions: aiAnalysis.refactoringSuggestions,
    };
  }

  private combinePerformanceAnalysis(
    staticAnalysis: any,
    aiAnalysis: any
  ): PerformanceReport {
    return {
      executionTime: staticAnalysis.executionTime,
      memoryUsage: staticAnalysis.memoryUsage,
      complexity: staticAnalysis.complexity,
      bottlenecks: [...staticAnalysis.bottlenecks, ...aiAnalysis.bottlenecks],
      optimizations: [
        ...staticAnalysis.optimizations,
        ...aiAnalysis.optimizations,
      ],
      performanceScore: staticAnalysis.performanceScore,
    };
  }

  private combineDebugResults(
    errorAnalysis: any,
    aiDebugResult: any
  ): DebugResult {
    return {
      fixedCode: aiDebugResult.fixedCode,
      explanation: aiDebugResult.explanation,
      confidence: aiDebugResult.confidence,
      originalError: errorAnalysis.errorType,
      appliedFixes: aiDebugResult.appliedFixes,
      suggestions: [...errorAnalysis.quickFixes, ...aiDebugResult.suggestions],
    };
  }

  private calculateComplexity(code: string, language: string): number {
    // Implementación básica de cálculo de complejidad
    const lines = code.split("\n");
    let complexity = 1;

    // Contar estructuras de control
    const controlStructures = [
      /if\s*\(/gi,
      /else\s*if\s*\(/gi,
      /for\s*\(/gi,
      /while\s*\(/gi,
      /switch\s*\(/gi,
      /case\s+/gi,
      /catch\s*\(/gi,
      /&&/g,
      /\|\|/g,
    ];

    controlStructures.forEach((pattern) => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return Math.min(10, complexity);
  }

  private calculateCyclomaticComplexity(
    code: string,
    language: string
  ): number {
    // Implementación básica de complejidad ciclomática
    let complexity = 1;

    // Contar decisiones
    const decisions = [
      /if\s*\(/gi,
      /else\s*if\s*\(/gi,
      /for\s*\(/gi,
      /while\s*\(/gi,
      /switch\s*\(/gi,
      /case\s+/gi,
      /catch\s*\(/gi,
      /&&/g,
      /\|\|/g,
      /\?/g,
      /:/g,
    ];

    decisions.forEach((pattern) => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return Math.min(20, complexity);
  }

  private checkIndentation(lines: string[]): string[] {
    const issues: string[] = [];
    let expectedIndent = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;

      const currentIndent = line.length - line.trimStart().length;

      if (currentIndent % 2 !== 0) {
        issues.push(`Línea ${index + 1}: Indentación inconsistente`);
      }
    });

    return issues;
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

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
      Logger.error("Error getting text safely", { error });
      return "Error: No se pudo obtener el texto.";
    }
  }
}

export const executionAnalyzer = ExecutionAnalyzer.getInstance();

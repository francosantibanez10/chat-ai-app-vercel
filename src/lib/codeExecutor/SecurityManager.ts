import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { SecurityReport, securityReportSchema, ResourceLimits } from "./types";
import { cacheManager } from "../cacheManager";
import { performanceMonitor } from "../performanceMonitor";

// Logger estructurado
class Logger {
  static info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        component: "SecurityManager",
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
        component: "SecurityManager",
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
        component: "SecurityManager",
        message,
        ...data,
      })
    );
  }
}

export class SecurityManager {
  private static instance: SecurityManager;
  private securityPatterns: Map<string, RegExp[]> = new Map();
  private blockedPatterns: Set<string> = new Set();
  private securityCache: Map<string, SecurityReport> = new Map();

  private constructor() {
    this.initializeSecurityPatterns();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Inicializar patrones de seguridad
   */
  private initializeSecurityPatterns(): void {
    // Patrones peligrosos por lenguaje
    this.securityPatterns.set("javascript", [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /fetch\s*\(/i,
      /XMLHttpRequest/i,
      /require\s*\(/i,
      /import\s*\(/i,
      /process\./i,
      /global\./i,
      /window\./i,
      /document\./i,
      /localStorage/i,
      /sessionStorage/i,
      /indexedDB/i,
      /WebSocket/i,
      /Worker/i,
      /SharedWorker/i,
      /navigator\./i,
      /location\./i,
    ]);

    this.securityPatterns.set("python", [
      /import\s+(os|subprocess|sys|importlib|urllib|requests|socket|multiprocessing)/i,
      /from\s+(os|subprocess|sys|importlib|urllib|requests|socket|multiprocessing)/i,
      /exec\s*\(/i,
      /eval\s*\(/i,
      /compile\s*\(/i,
      /__import__\s*\(/i,
      /open\s*\(/i,
      /file\s*\(/i,
      /input\s*\(/i,
      /raw_input\s*\(/i,
      /globals\s*\(/i,
      /locals\s*\(/i,
      /vars\s*\(/i,
      /dir\s*\(/i,
      /help\s*\(/i,
    ]);

    this.securityPatterns.set("sql", [
      /DROP\s+(TABLE|DATABASE|INDEX|VIEW|TRIGGER|PROCEDURE|FUNCTION)/i,
      /DELETE\s+FROM/i,
      /TRUNCATE\s+TABLE/i,
      /ALTER\s+(TABLE|DATABASE|INDEX|VIEW|TRIGGER|PROCEDURE|FUNCTION)/i,
      /CREATE\s+(TABLE|DATABASE|INDEX|VIEW|TRIGGER|PROCEDURE|FUNCTION)/i,
      /GRANT\s+/i,
      /REVOKE\s+/i,
      /EXEC\s+/i,
      /EXECUTE\s+/i,
      /xp_cmdshell/i,
      /sp_configure/i,
      /BACKUP\s+DATABASE/i,
      /RESTORE\s+DATABASE/i,
    ]);

    this.securityPatterns.set("bash", [
      /rm\s+-rf/i,
      /dd\s+/i,
      /mkfs\s+/i,
      /fdisk\s+/i,
      /chmod\s+777/i,
      /chown\s+root/i,
      /wget\s+/i,
      /curl\s+/i,
      /nc\s+/i,
      /telnet\s+/i,
      /ssh\s+/i,
      /scp\s+/i,
      /rsync\s+/i,
      /tar\s+/i,
      /gzip\s+/i,
      /bzip2\s+/i,
      /zip\s+/i,
      /unzip\s+/i,
      /mount\s+/i,
      /umount\s+/i,
      /sudo\s+/i,
      /su\s+/i,
      /passwd\s+/i,
      /useradd\s+/i,
      /userdel\s+/i,
      /groupadd\s+/i,
      /groupdel\s+/i,
    ]);

    // Patrones bloqueados globalmente
    this.blockedPatterns.add("password");
    this.blockedPatterns.add("secret");
    this.blockedPatterns.add("token");
    this.blockedPatterns.add("key");
    this.blockedPatterns.add("credential");
    this.blockedPatterns.add("auth");
    this.blockedPatterns.add("login");
  }

  /**
   * Analizar seguridad del código
   */
  async analyzeSecurity(
    code: string,
    language: string,
    context?: { userId: string; sessionId?: string }
  ): Promise<SecurityReport> {
    const startTime = Date.now();
    const cacheKey = `security_analysis:${language}:${this.hashCode(code)}`;

    try {
      // Verificar caché
      const cached = await cacheManager.get<SecurityReport>(cacheKey, {
        prefix: "security",
        ttl: 3600, // 1 hora
      });

      if (cached) {
        Logger.info("Security analysis found in cache", {
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
      const validatedReport = securityReportSchema.parse(combinedAnalysis);

      // Guardar en caché
      await cacheManager.set(cacheKey, validatedReport, {
        prefix: "security",
        ttl: 3600,
      });

      // Registrar métricas
      performanceMonitor.recordMetric("security_analysis", {
        language,
        duration: Date.now() - startTime,
        threatLevel: validatedReport.threatLevel,
        vulnerabilitiesCount: validatedReport.vulnerabilities.length,
        isSafe: validatedReport.isSafe,
        userId: context?.userId,
      });

      Logger.info("Security analysis completed", {
        language,
        threatLevel: validatedReport.threatLevel,
        vulnerabilitiesCount: validatedReport.vulnerabilities.length,
        isSafe: validatedReport.isSafe,
      });

      return validatedReport;
    } catch (error) {
      Logger.error("Error in security analysis", {
        error,
        language,
        codeLength: code.length,
      });

      // Reporte de fallback
      return {
        threatLevel: "high",
        vulnerabilities: [
          {
            type: "analysis_error",
            description: "Error en análisis de seguridad",
            severity: "high",
            suggestion: "Revisar código manualmente",
          },
        ],
        sanitizedCode: this.sanitizeCode(code, language),
        isSafe: false,
        securityScore: 0.0,
      };
    }
  }

  /**
   * Análisis estático de seguridad
   */
  private performStaticAnalysis(
    code: string,
    language: string
  ): {
    vulnerabilities: Array<{
      type: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      line?: number;
      suggestion: string;
    }>;
    threatLevel: "low" | "medium" | "high" | "critical";
    securityScore: number;
  } {
    const vulnerabilities: Array<{
      type: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      line?: number;
      suggestion: string;
    }> = [];

    const patterns = this.securityPatterns.get(language.toLowerCase()) || [];
    const lines = code.split("\n");

    // Verificar patrones peligrosos
    lines.forEach((line, index) => {
      patterns.forEach((pattern, patternIndex) => {
        if (pattern.test(line)) {
          const severity = this.getSeverityForPattern(language, patternIndex);
          vulnerabilities.push({
            type: "dangerous_pattern",
            description: `Patrón peligroso detectado: ${pattern.source}`,
            severity,
            line: index + 1,
            suggestion: `Evitar uso de ${pattern.source}`,
          });
        }
      });
    });

    // Verificar patrones bloqueados globalmente
    this.blockedPatterns.forEach((pattern) => {
      if (code.toLowerCase().includes(pattern.toLowerCase())) {
        vulnerabilities.push({
          type: "blocked_pattern",
          description: `Patrón bloqueado detectado: ${pattern}`,
          severity: "medium",
          suggestion: `Evitar uso de ${pattern}`,
        });
      }
    });

    // Verificar longitud del código
    if (code.length > 10000) {
      vulnerabilities.push({
        type: "code_length",
        description: "Código demasiado largo",
        severity: "low",
        suggestion: "Considerar dividir el código en funciones más pequeñas",
      });
    }

    // Calcular score de seguridad
    const securityScore = Math.max(0, 1 - vulnerabilities.length * 0.2);

    // Determinar nivel de amenaza
    const threatLevel = this.calculateThreatLevel(vulnerabilities);

    return {
      vulnerabilities,
      threatLevel,
      securityScore,
    };
  }

  /**
   * Análisis de seguridad con IA
   */
  private async performAIAnalysis(
    code: string,
    language: string
  ): Promise<{
    vulnerabilities: Array<{
      type: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      line?: number;
      suggestion: string;
    }>;
    threatLevel: "low" | "medium" | "high" | "critical";
    securityScore: number;
  }> {
    const analysisPrompt = `
Analiza la seguridad del siguiente código y identifica vulnerabilidades potenciales:

Lenguaje: ${language}
Código:
\`\`\`${language}
${code}
\`\`\`

Identifica:
1. Vulnerabilidades de seguridad
2. Patrones peligrosos
3. Riesgos de ejecución
4. Problemas de privacidad
5. Sugerencias de mejora

Responde SOLO con JSON válido:
{
  "vulnerabilities": [
    {
      "type": "tipo_vulnerabilidad",
      "description": "descripción detallada",
      "severity": "low|medium|high|critical",
      "line": número_línea_opcional,
      "suggestion": "sugerencia de corrección"
    }
  ],
  "threatLevel": "low|medium|high|critical",
  "securityScore": 0.0-1.0,
  "additionalRisks": ["riesgo1", "riesgo2"],
  "recommendations": ["recomendación1", "recomendación2"]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.1,
        maxTokens: 800,
      });

      const aiResult = JSON.parse(await this.getTextSafely(result));

      return {
        vulnerabilities: aiResult.vulnerabilities || [],
        threatLevel: aiResult.threatLevel || "medium",
        securityScore: aiResult.securityScore || 0.5,
      };
    } catch (error) {
      Logger.error("Error in AI security analysis", { error });
      return {
        vulnerabilities: [],
        threatLevel: "medium",
        securityScore: 0.5,
      };
    }
  }

  /**
   * Combinar análisis estático y de IA
   */
  private combineAnalysis(
    staticAnalysis: any,
    aiAnalysis: any
  ): SecurityReport {
    // Combinar vulnerabilidades
    const allVulnerabilities = [
      ...staticAnalysis.vulnerabilities,
      ...aiAnalysis.vulnerabilities,
    ];

    // Eliminar duplicados
    const uniqueVulnerabilities = allVulnerabilities.filter(
      (vuln, index, self) =>
        index ===
        self.findIndex(
          (v) => v.type === vuln.type && v.description === vuln.description
        )
    );

    // Calcular score combinado
    const combinedScore =
      (staticAnalysis.securityScore + aiAnalysis.securityScore) / 2;

    // Determinar nivel de amenaza final
    const finalThreatLevel = this.calculateThreatLevel(uniqueVulnerabilities);

    return {
      threatLevel: finalThreatLevel,
      vulnerabilities: uniqueVulnerabilities,
      sanitizedCode: "", // Se llenará después
      isSafe: finalThreatLevel === "low" && combinedScore > 0.7,
      securityScore: combinedScore,
    };
  }

  /**
   * Sanitizar código
   */
  sanitizeCode(code: string, language: string): string {
    let sanitized = code;

    switch (language.toLowerCase()) {
      case "javascript":
      case "typescript":
        sanitized = this.sanitizeJavaScript(code);
        break;
      case "python":
        sanitized = this.sanitizePython(code);
        break;
      case "sql":
        sanitized = this.sanitizeSQL(code);
        break;
      case "bash":
        sanitized = this.sanitizeBash(code);
        break;
      default:
        sanitized = this.sanitizeGeneric(code);
    }

    return sanitized;
  }

  /**
   * Sanitizar JavaScript/TypeScript
   */
  private sanitizeJavaScript(code: string): string {
    let sanitized = code;

    // Remover funciones peligrosas
    const dangerousFunctions = [
      "eval",
      "Function",
      "setTimeout",
      "setInterval",
      "fetch",
      "XMLHttpRequest",
      "require",
      "import",
      "process",
      "global",
      "window",
      "document",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "WebSocket",
      "Worker",
      "SharedWorker",
      "navigator",
      "location",
    ];

    dangerousFunctions.forEach((func) => {
      const regex = new RegExp(`\\b${func}\\b`, "g");
      sanitized = sanitized.replace(
        regex,
        `/* ${func} blocked for security */`
      );
    });

    return sanitized;
  }

  /**
   * Sanitizar Python
   */
  private sanitizePython(code: string): string {
    let sanitized = code;

    // Remover imports peligrosos
    const dangerousImports = [
      "os",
      "subprocess",
      "sys",
      "importlib",
      "urllib",
      "requests",
      "socket",
      "multiprocessing",
    ];

    dangerousImports.forEach((module) => {
      const importRegex = new RegExp(`import\\s+${module}\\b`, "g");
      const fromRegex = new RegExp(`from\\s+${module}\\b`, "g");
      sanitized = sanitized.replace(
        importRegex,
        `# import ${module} blocked for security`
      );
      sanitized = sanitized.replace(
        fromRegex,
        `# from ${module} blocked for security`
      );
    });

    // Remover funciones peligrosas
    const dangerousFunctions = ["exec", "eval", "compile", "__import__"];
    dangerousFunctions.forEach((func) => {
      const regex = new RegExp(`\\b${func}\\s*\\(`, "g");
      sanitized = sanitized.replace(regex, `# ${func} blocked for security`);
    });

    return sanitized;
  }

  /**
   * Sanitizar SQL
   */
  private sanitizeSQL(code: string): string {
    const dangerousKeywords = [
      "DROP",
      "DELETE",
      "TRUNCATE",
      "ALTER",
      "CREATE",
      "GRANT",
      "REVOKE",
      "EXEC",
      "EXECUTE",
      "xp_cmdshell",
      "sp_configure",
      "BACKUP",
      "RESTORE",
    ];

    let sanitized = code;
    dangerousKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(sanitized)) {
        throw new Error(`Operación SQL peligrosa detectada: ${keyword}`);
      }
    });

    return sanitized;
  }

  /**
   * Sanitizar Bash
   */
  private sanitizeBash(code: string): string {
    const dangerousCommands = [
      "rm -rf",
      "dd",
      "mkfs",
      "fdisk",
      "chmod 777",
      "wget",
      "curl",
      "nc",
      "telnet",
      "ssh",
      "scp",
      "rsync",
      "mount",
      "umount",
      "sudo",
      "su",
      "passwd",
      "useradd",
      "userdel",
      "groupadd",
      "groupdel",
    ];

    let sanitized = code;
    dangerousCommands.forEach((cmd) => {
      if (sanitized.includes(cmd)) {
        throw new Error(`Comando Bash peligroso detectado: ${cmd}`);
      }
    });

    return sanitized;
  }

  /**
   * Sanitizar código genérico
   */
  private sanitizeGeneric(code: string): string {
    // Remover comentarios que puedan contener información sensible
    let sanitized = code.replace(/\/\*[\s\S]*?\*\//g, "/* comment removed */");
    sanitized = sanitized.replace(/\/\/.*$/gm, "// comment removed");
    sanitized = sanitized.replace(/#.*$/gm, "# comment removed");

    return sanitized;
  }

  /**
   * Obtener severidad para un patrón
   */
  private getSeverityForPattern(
    language: string,
    patternIndex: number
  ): "low" | "medium" | "high" | "critical" {
    const severityMap: Record<string, number[]> = {
      javascript: [2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 2, 2],
      python: [3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 2, 2, 2, 1, 1],
      sql: [3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3],
      bash: [
        3, 3, 3, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3,
        3, 3,
      ],
    };

    const severityLevels: ("low" | "medium" | "high" | "critical")[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    const patternSeverities = severityMap[language.toLowerCase()] || [];
    const severityIndex = patternSeverities[patternIndex] || 1;

    return severityLevels[severityIndex - 1] || "medium";
  }

  /**
   * Calcular nivel de amenaza
   */
  private calculateThreatLevel(
    vulnerabilities: Array<{ severity: string }>
  ): "low" | "medium" | "high" | "critical" {
    const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalScore = vulnerabilities.reduce((sum, vuln) => {
      return (
        sum +
        (severityScores[vuln.severity as keyof typeof severityScores] || 1)
      );
    }, 0);

    if (totalScore === 0) return "low";
    if (totalScore <= 3) return "low";
    if (totalScore <= 6) return "medium";
    if (totalScore <= 10) return "high";
    return "critical";
  }

  /**
   * Hash simple del código
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
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
      Logger.error("Error getting text safely", { error });
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Verificar si el código es seguro para ejecutar
   */
  isCodeSafe(securityReport: SecurityReport): boolean {
    return securityReport.isSafe && securityReport.securityScore > 0.7;
  }

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats(): {
    totalAnalyses: number;
    safeExecutions: number;
    blockedExecutions: number;
    averageSecurityScore: number;
    threatLevelBreakdown: Record<string, number>;
    vulnerabilityTypes: Record<string, number>;
  } {
    // Implementar estadísticas basadas en el caché y logs
    return {
      totalAnalyses: 0,
      safeExecutions: 0,
      blockedExecutions: 0,
      averageSecurityScore: 0.8,
      threatLevelBreakdown: { low: 60, medium: 25, high: 10, critical: 5 },
      vulnerabilityTypes: {
        dangerous_pattern: 40,
        blocked_pattern: 30,
        code_length: 20,
        ai_detected: 10,
      },
    };
  }
}

export const securityManager = SecurityManager.getInstance();

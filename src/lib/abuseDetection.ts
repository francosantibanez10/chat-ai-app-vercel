import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { cacheManager } from "./cacheManager";
import { rateLimiter, RateLimiter } from "./rateLimiter";
import { performanceMonitor } from "./performanceMonitor";

// Schemas de validación
const messageSchema = z.string().min(1).max(5000);
const abuseCheckSchema = z.object({
  isAbusive: z.boolean(),
  confidence: z.number().min(0).max(1),
  categories: z.array(z.string()),
  severity: z.enum(["low", "medium", "high", "critical"]),
  reasons: z.array(z.string()),
  suggestedAction: z.enum(["allow", "warn", "block", "flag"]),
});

const spamCheckSchema = z.object({
  isSpam: z.boolean(),
  confidence: z.number().min(0).max(1),
  spamType: z.enum([
    "repetitive",
    "promotional",
    "malicious",
    "automated",
    "none",
  ]),
  indicators: z.array(z.string()),
  suggestedAction: z.enum(["allow", "rate_limit", "block"]),
});

export interface AbuseCheck {
  isAbusive: boolean;
  confidence: number; // 0-1
  categories: string[];
  severity: "low" | "medium" | "high" | "critical";
  reasons: string[];
  suggestedAction: "allow" | "warn" | "block" | "flag";
}

export interface SpamCheck {
  isSpam: boolean;
  confidence: number; // 0-1
  spamType: "repetitive" | "promotional" | "malicious" | "automated" | "none";
  indicators: string[];
  suggestedAction: "allow" | "rate_limit" | "block";
}

export interface UserBehavior {
  userId: string;
  messageCount: number;
  averageMessageLength: number;
  timeBetweenMessages: number; // seconds
  repeatedPatterns: string[];
  suspiciousActivity: string[];
  lastActivity: Date;
  riskScore: number; // 0-1
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

export class AbuseDetection {
  private static instance: AbuseDetection;
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private blockedUsers: Set<string> = new Set();
  private rateLimits: Map<string, { count: number; resetTime: number }> =
    new Map();

  private constructor() {
    // Limpiar caché local periódicamente
    setInterval(() => {
      cacheManager.cleanupLocalCache();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  static getInstance(): AbuseDetection {
    if (!AbuseDetection.instance) {
      AbuseDetection.instance = new AbuseDetection();
    }
    return AbuseDetection.instance;
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
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      Logger.error("Error getting text safely:", error);
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Verifica si un mensaje es abusivo usando prompts estructurados con caché
   */
  async checkForAbuse(
    message: string,
    context: any[] = []
  ): Promise<AbuseCheck> {
    const startTime = Date.now();

    try {
      // Validar entrada
      const safeMessage = messageSchema.parse(message);
      const conversationContext = Array.isArray(context) ? context : [];

      // Generar clave de caché basada en el contenido del mensaje
      const cacheKey = `abuse:${Buffer.from(safeMessage)
        .toString("base64")
        .slice(0, 50)}`;

      // Intentar obtener del caché primero
      const cachedResult = await cacheManager.get<AbuseCheck>(cacheKey, {
        ttl: 3600, // 1 hora
        prefix: "abuse_detection",
      });

      if (cachedResult) {
        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric(
          "abuse_check",
          duration,
          true,
          undefined,
          {
            isAbusive: cachedResult.isAbusive,
            confidence: cachedResult.confidence,
            cacheHit: true,
          }
        );

        Logger.info("Abuse check cache hit", {
          messageLength: safeMessage.length,
          isAbusive: cachedResult.isAbusive,
          confidence: cachedResult.confidence,
        });
        return cachedResult;
      }

      Logger.info("Checking for abuse", {
        messageLength: safeMessage.length,
        contextLength: conversationContext.length,
      });

      const abusePrompt = `
Analiza si este mensaje contiene contenido abusivo:

Mensaje: "${safeMessage}"
Contexto: ${conversationContext.map((m) => m.content).join(" | ")}

Categorías de abuso a detectar:
- Hate speech (discurso de odio)
- Harassment (acoso)
- Threats (amenazas)
- Inappropriate content (contenido inapropiado)
- Violence (violencia)

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional:
{
  "isAbusive": true/false,
  "confidence": 0.0-1.0,
  "categories": ["categoría1", "categoría2"],
  "severity": "low" | "medium" | "high" | "critical",
  "reasons": ["razón1", "razón2"],
  "suggestedAction": "allow" | "warn" | "block" | "flag"
}`;

      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: abusePrompt }],
        temperature: 0.1,
        maxTokens: 400,
      });

      const textResult = await this.getTextSafely(result);

      // Limpiar y parsear JSON de manera robusta
      const cleanedText = textResult.replace(/```json\s*|\s*```/g, "").trim();
      const parsedResult = JSON.parse(cleanedText);
      const validatedResult = abuseCheckSchema.parse(parsedResult);

      // Guardar en caché
      await cacheManager.set(cacheKey, validatedResult, {
        ttl: 3600, // 1 hora
        prefix: "abuse_detection",
      });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "abuse_check",
        duration,
        true,
        undefined,
        {
          isAbusive: validatedResult.isAbusive,
          confidence: validatedResult.confidence,
          severity: validatedResult.severity,
          cacheHit: false,
        }
      );

      Logger.info("Abuse check completed", {
        isAbusive: validatedResult.isAbusive,
        confidence: validatedResult.confidence,
        severity: validatedResult.severity,
      });

      return validatedResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "abuse_check",
        duration,
        false,
        errorMessage
      );
      Logger.error("Error checking for abuse", error);

      // Fallback seguro
      return {
        isAbusive: false,
        confidence: 0,
        categories: [],
        severity: "low",
        reasons: ["Error en detección - permitido por seguridad"],
        suggestedAction: "allow",
      };
    }
  }

  /**
   * Verifica si un mensaje es spam usando prompts estructurados con caché
   */
  async checkForSpam(
    message: string,
    userId: string,
    userHistory: any[] = []
  ): Promise<SpamCheck> {
    const startTime = Date.now();

    try {
      // Validar entrada
      const safeMessage = messageSchema.parse(message);
      const history = Array.isArray(userHistory) ? userHistory : [];

      // Generar clave de caché
      const cacheKey = `spam:${userId}:${Buffer.from(safeMessage)
        .toString("base64")
        .slice(0, 50)}`;

      // Intentar obtener del caché
      const cachedResult = await cacheManager.get<SpamCheck>(cacheKey, {
        ttl: 1800, // 30 minutos
        prefix: "spam_detection",
      });

      if (cachedResult) {
        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric(
          "spam_check",
          duration,
          true,
          undefined,
          {
            userId,
            isSpam: cachedResult.isSpam,
            spamType: cachedResult.spamType,
            cacheHit: true,
          }
        );

        Logger.info("Spam check cache hit", {
          userId,
          isSpam: cachedResult.isSpam,
          spamType: cachedResult.spamType,
        });
        return cachedResult;
      }

      Logger.info("Checking for spam", {
        userId,
        messageLength: safeMessage.length,
        historyLength: history.length,
      });

      const spamPrompt = `
Analiza si este mensaje es spam:

Mensaje: "${safeMessage}"
Historial reciente del usuario: ${history.map((m) => m.content).join(" | ")}

Tipos de spam a detectar:
- Repetitivo: mensajes similares repetidos
- Promocional: publicidad no solicitada
- Malicioso: enlaces o contenido peligroso
- Automatizado: patrones de bot

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional:
{
  "isSpam": true/false,
  "confidence": 0.0-1.0,
  "spamType": "repetitive" | "promotional" | "malicious" | "automated" | "none",
  "indicators": ["indicador1", "indicador2"],
  "suggestedAction": "allow" | "rate_limit" | "block"
}`;

      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: spamPrompt }],
        temperature: 0.1,
        maxTokens: 300,
      });

      const textResult = await this.getTextSafely(result);

      // Limpiar y parsear JSON de manera robusta
      const cleanedText = textResult.replace(/```json\s*|\s*```/g, "").trim();
      const parsedResult = JSON.parse(cleanedText);
      const validatedResult = spamCheckSchema.parse(parsedResult);

      // Guardar en caché
      await cacheManager.set(cacheKey, validatedResult, {
        ttl: 1800, // 30 minutos
        prefix: "spam_detection",
      });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric("spam_check", duration, true, undefined, {
        userId,
        isSpam: validatedResult.isSpam,
        spamType: validatedResult.spamType,
        confidence: validatedResult.confidence,
        cacheHit: false,
      });

      Logger.info("Spam check completed", {
        userId,
        isSpam: validatedResult.isSpam,
        spamType: validatedResult.spamType,
        confidence: validatedResult.confidence,
      });

      return validatedResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "spam_check",
        duration,
        false,
        errorMessage,
        { userId }
      );
      Logger.error("Error checking for spam", { userId, error });

      // Fallback seguro
      return {
        isSpam: false,
        confidence: 0,
        spamType: "none",
        indicators: ["Error en detección - permitido por seguridad"],
        suggestedAction: "allow",
      };
    }
  }

  /**
   * Verifica límites de velocidad usando el sistema especializado
   */
  async checkRateLimit(
    userId: string,
    maxMessages: number = 10,
    windowMinutes: number = 5
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const config = RateLimiter.getPresetConfig("normal");

      // Personalizar configuración si se proporcionan parámetros específicos
      if (maxMessages !== 10 || windowMinutes !== 5) {
        config.maxRequests = maxMessages;
        config.windowMs = windowMinutes * 60 * 1000;
      }

      const result = await rateLimiter.checkRateLimit(userId, config);

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric(
        "rate_limit_check",
        duration,
        true,
        undefined,
        {
          userId,
          allowed: result.allowed,
          remaining: result.remaining,
        }
      );

      Logger.info("Rate limit check", {
        userId,
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
      });

      return result.allowed;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      performanceMonitor.recordMetric(
        "rate_limit_check",
        duration,
        false,
        errorMessage,
        { userId }
      );
      Logger.error("Rate limit error", { userId, error });

      // Fallback: permitir la solicitud en caso de error
      return true;
    }
  }

  /**
   * Detecta patrones sospechosos
   */
  detectSuspiciousPatterns(message: string, userHistory: any[]): string[] {
    const patterns: string[] = [];

    // Detectar repetición excesiva
    const recentMessages = userHistory.slice(-5);
    const messageLower = message.toLowerCase();
    const repeatedCount = recentMessages.filter(
      (m) =>
        m.content.toLowerCase().includes(messageLower) ||
        messageLower.includes(m.content.toLowerCase())
    ).length;

    if (repeatedCount >= 2) {
      patterns.push("repetitive_messages");
    }

    // Detectar enlaces sospechosos
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = message.match(urlRegex) || [];
    if (urls.length > 3) {
      patterns.push("excessive_links");
    }

    // Detectar palabras clave sospechosas
    const suspiciousKeywords = [
      "buy now",
      "click here",
      "limited time",
      "act now",
      "make money",
      "earn money",
      "work from home",
      "get rich",
      "free money",
      "lottery",
      "inheritance",
      "nigerian prince",
    ];

    const foundKeywords = suspiciousKeywords.filter((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      patterns.push("suspicious_keywords");
    }

    // Detectar mensajes muy cortos repetitivos
    if (message.length < 10 && userHistory.length > 5) {
      const shortMessages = userHistory.filter((m) => m.content.length < 10);
      if (shortMessages.length > 3) {
        patterns.push("short_repetitive_messages");
      }
    }

    return patterns;
  }

  /**
   * Actualiza el comportamiento del usuario
   */
  private updateUserBehavior(
    userId: string,
    message: string,
    abuseCheck: AbuseCheck
  ): void {
    const now = new Date();
    const behavior = this.userBehaviors.get(userId) || {
      userId,
      messageCount: 0,
      averageMessageLength: 0,
      timeBetweenMessages: 0,
      repeatedPatterns: [],
      suspiciousActivity: [],
      lastActivity: now,
      riskScore: 0,
    };

    // Actualizar contadores
    behavior.messageCount++;
    behavior.lastActivity = now;

    // Calcular longitud promedio
    behavior.averageMessageLength =
      (behavior.averageMessageLength * (behavior.messageCount - 1) +
        message.length) /
      behavior.messageCount;

    // Detectar patrones repetitivos
    const patterns = this.detectSuspiciousPatterns(message, []);
    behavior.repeatedPatterns = [
      ...new Set([...behavior.repeatedPatterns, ...patterns]),
    ];

    // Actualizar actividad sospechosa
    if (abuseCheck.isAbusive || patterns.length > 0) {
      behavior.suspiciousActivity.push(
        `${now.toISOString()}: ${abuseCheck.reasons.join(", ")}`
      );
    }

    // Calcular puntuación de riesgo
    behavior.riskScore = this.calculateRiskScore(behavior, abuseCheck);

    this.userBehaviors.set(userId, behavior);
  }

  /**
   * Calcula la puntuación de riesgo del usuario
   */
  private calculateRiskScore(
    behavior: UserBehavior,
    abuseCheck: AbuseCheck
  ): number {
    let riskScore = 0;

    // Riesgo por mensajes abusivos
    if (abuseCheck.isAbusive) {
      riskScore += 0.3;
      if (
        abuseCheck.severity === "high" ||
        abuseCheck.severity === "critical"
      ) {
        riskScore += 0.2;
      }
    }

    // Riesgo por patrones sospechosos
    riskScore += behavior.repeatedPatterns.length * 0.1;

    // Riesgo por actividad sospechosa reciente
    const recentSuspiciousActivity = behavior.suspiciousActivity.filter(
      (activity) => {
        const activityTime = new Date(activity.split(":")[0]);
        const hoursAgo =
          (Date.now() - activityTime.getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      }
    );
    riskScore += recentSuspiciousActivity.length * 0.15;

    // Riesgo por velocidad de mensajes
    if (behavior.messageCount > 50) {
      riskScore += 0.1;
    }

    return Math.min(riskScore, 1);
  }

  /**
   * Bloquea un usuario
   */
  blockUser(userId: string, reason: string): void {
    this.blockedUsers.add(userId);
    console.log(`User ${userId} blocked: ${reason}`);
  }

  /**
   * Verifica si un usuario está bloqueado
   */
  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  /**
   * Desbloquea un usuario
   */
  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    console.log(`User ${userId} unblocked`);
  }

  /**
   * Obtiene el comportamiento de un usuario
   */
  getUserBehavior(userId: string): UserBehavior | null {
    return this.userBehaviors.get(userId) || null;
  }

  /**
   * Obtiene estadísticas de abuso
   */
  getAbuseStats(): {
    totalUsers: number;
    blockedUsers: number;
    highRiskUsers: number;
    averageRiskScore: number;
  } {
    const users = Array.from(this.userBehaviors.values());
    const totalUsers = users.length;
    const blockedUsers = this.blockedUsers.size;
    const highRiskUsers = users.filter((u) => u.riskScore > 0.7).length;
    const averageRiskScore =
      users.length > 0
        ? users.reduce((sum, u) => sum + u.riskScore, 0) / users.length
        : 0;

    return {
      totalUsers,
      blockedUsers,
      highRiskUsers,
      averageRiskScore,
    };
  }

  /**
   * Limpia datos antiguos
   */
  cleanupOldData(maxAgeDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    // Limpiar comportamientos antiguos
    for (const [userId, behavior] of this.userBehaviors.entries()) {
      if (behavior.lastActivity < cutoffDate && behavior.riskScore < 0.3) {
        this.userBehaviors.delete(userId);
      }
    }

    // Limpiar rate limits antiguos
    const now = Date.now();
    for (const [userId, limit] of this.rateLimits.entries()) {
      if (now > limit.resetTime) {
        this.rateLimits.delete(userId);
      }
    }
  }
}

export const abuseDetection = AbuseDetection.getInstance();

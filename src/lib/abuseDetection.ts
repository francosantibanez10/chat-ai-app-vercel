import { cacheManager } from "./cacheManager";
import { rateLimiter, RateLimiter } from "./rateLimiter";

// Schemas de validación
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

  private constructor() {}

  static getInstance(): AbuseDetection {
    if (!AbuseDetection.instance) {
      AbuseDetection.instance = new AbuseDetection();
    }
    return AbuseDetection.instance;
  }

  // Patrones básicos de detección de abuso
  private readonly abusePatterns = [
    /\b(kill|murder|suicide|bomb|terrorist)\b/i,
    /\b(hack|crack|steal|rob|fraud)\b/i,
    /\b(hate|racist|sexist|discriminate)\b/i,
    /\b(drugs|cocaine|heroin|meth)\b/i,
    /\b(weapon|gun|knife|explosive)\b/i,
  ];

  // Patrones de spam
  private readonly spamPatterns = [
    /\b(buy now|limited time|act fast|click here)\b/i,
    /\b(free money|make money fast|work from home)\b/i,
    /\b(viagra|cialis|weight loss|diet pills)\b/i,
    /\b(casino|poker|bet|lottery)\b/i,
    /\b(loan|credit|debt|refinance)\b/i,
  ];

  // Palabras repetitivas
  private readonly repetitivePatterns = [
    /(.)\1{4,}/, // Caracteres repetidos más de 4 veces
    /\b(\w+)(\s+\1){3,}\b/, // Palabras repetidas más de 3 veces
  ];

  async checkForAbuse(
    message: string,
    context: any[] = []
  ): Promise<AbuseCheck> {
    try {
      const normalizedMessage = message.toLowerCase().trim();
      const reasons: string[] = [];
      const categories: string[] = [];
      let confidence = 0;
      let severity: "low" | "medium" | "high" | "critical" = "low";

      // Verificar patrones de abuso
      for (const pattern of this.abusePatterns) {
        if (pattern.test(normalizedMessage)) {
          confidence += 0.3;
          reasons.push(`Contenido potencialmente abusivo detectado`);
          categories.push("abuse");
          severity = confidence > 0.6 ? "high" : "medium";
        }
      }

      // Verificar longitud excesiva
      if (message.length > 2000) {
        confidence += 0.2;
        reasons.push("Mensaje demasiado largo");
        categories.push("length");
      }

      // Verificar caracteres repetitivos
      if (this.repetitivePatterns.some((p) => p.test(message))) {
        confidence += 0.4;
        reasons.push("Patrones repetitivos detectados");
        categories.push("repetitive");
        severity = "medium";
      }

      // Verificar contenido vacío o muy corto
      if (message.trim().length < 3) {
        confidence += 0.1;
        reasons.push("Mensaje muy corto");
        categories.push("length");
      }

      // Determinar acción sugerida
      let suggestedAction: "allow" | "warn" | "block" | "flag" = "allow";
      if (confidence > 0.8) {
        suggestedAction = "block";
      } else if (confidence > 0.5) {
        suggestedAction = "warn";
      } else if (confidence > 0.3) {
        suggestedAction = "flag";
      }

      const result: AbuseCheck = {
        isAbusive: confidence > 0.5,
        confidence: Math.min(confidence, 1),
        categories,
        severity,
        reasons,
        suggestedAction,
      };

      Logger.info("Checking for abuse", {
        messageLength: message.length,
        contextLength: context.length,
        confidence: result.confidence,
        isAbusive: result.isAbusive,
      });

      return result;
    } catch (error) {
      Logger.error("Error in abuse detection", error);
      // En caso de error, permitir el mensaje
      return {
        isAbusive: false,
        confidence: 0,
        categories: [],
        severity: "low",
        reasons: ["Error en detección de abuso"],
        suggestedAction: "allow",
      };
    }
  }

  async checkForSpam(
    message: string,
    userId: string,
    userHistory: any[] = []
  ): Promise<SpamCheck> {
    try {
      // En desarrollo, ser más permisivo
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // En desarrollo, solo detectar spam muy obvio
        const normalizedMessage = message.toLowerCase().trim();
        
        // Solo bloquear spam muy evidente
        const obviousSpamPatterns = [
          /\b(buy now|limited time|act fast|click here)\b/i,
          /\b(free money|make money fast|work from home)\b/i,
          /\b(viagra|cialis|weight loss|diet pills)\b/i,
        ];
        
        for (const pattern of obviousSpamPatterns) {
          if (pattern.test(normalizedMessage)) {
            return {
              isSpam: true,
              confidence: 0.9,
              spamType: "promotional",
              indicators: ["Spam obvio detectado"],
              suggestedAction: "block",
            };
          }
        }
        
        // En desarrollo, permitir casi todo
        return {
          isSpam: false,
          confidence: 0,
          spamType: "none",
          indicators: [],
          suggestedAction: "allow",
        };
      }

      // Lógica normal para producción
      const normalizedMessage = message.toLowerCase().trim();
      const indicators: string[] = [];
      let confidence = 0;
      let spamType:
        | "repetitive"
        | "promotional"
        | "malicious"
        | "automated"
        | "none" = "none";

      // Verificar patrones de spam (reducir sensibilidad)
      for (const pattern of this.spamPatterns) {
        if (pattern.test(normalizedMessage)) {
          confidence += 0.2; // Reducido de 0.4 a 0.2
          indicators.push("Patrones de spam detectados");
          spamType = "promotional";
        }
      }

      // Verificar mensajes repetitivos del usuario (más permisivo)
      const recentMessages = userHistory.slice(-5);
      const messageHash = this.hashMessage(normalizedMessage);
      const repeatedCount = recentMessages.filter(
        (msg) =>
          this.hashMessage(msg.content?.toLowerCase() || "") === messageHash
      ).length;

      if (repeatedCount > 3) { // Aumentado de 2 a 3
        confidence += 0.4; // Reducido de 0.6 a 0.4
        indicators.push("Mensajes repetitivos del usuario");
        spamType = "repetitive";
      }

      // Verificar velocidad de mensajes (más permisivo)
      if (userHistory.length > 0) {
        const lastMessage = userHistory[userHistory.length - 1];
        const timeDiff = Date.now() - (lastMessage.timestamp || Date.now());
        if (timeDiff < 500) {
          // Reducido de 1000ms a 500ms
          confidence += 0.2; // Reducido de 0.3 a 0.2
          indicators.push("Mensajes enviados muy rápido");
          spamType = "automated";
        }
      }

      // Verificar URLs sospechosas (más permisivo)
      const urlPattern = /https?:\/\/[^\s]+/g;
      const urls = message.match(urlPattern);
      if (urls && urls.length > 5) { // Aumentado de 2 a 5
        confidence += 0.2; // Reducido de 0.3 a 0.2
        indicators.push("Demasiadas URLs en el mensaje");
        spamType = "promotional";
      }

      // Determinar acción sugerida (más permisivo)
      let suggestedAction: "allow" | "rate_limit" | "block" = "allow";
      if (confidence > 0.8) { // Aumentado de 0.7 a 0.8
        suggestedAction = "block";
      } else if (confidence > 0.6) { // Aumentado de 0.4 a 0.6
        suggestedAction = "rate_limit";
      }

      const result: SpamCheck = {
        isSpam: confidence > 0.7, // Aumentado de 0.5 a 0.7
        confidence: Math.min(confidence, 1),
        spamType,
        indicators,
        suggestedAction,
      };

      Logger.info("Checking for spam", {
        userId,
        messageLength: message.length,
        historyLength: userHistory.length,
        confidence: result.confidence,
        isSpam: result.isSpam,
      });

      return result;
    } catch (error) {
      Logger.error("Error in spam detection", error);
      // En caso de error, permitir el mensaje
      return {
        isSpam: false,
        confidence: 0,
        spamType: "none",
        indicators: ["Error en detección de spam"],
        suggestedAction: "allow",
      };
    }
  }

  async checkRateLimit(
    userId: string,
    maxMessages: number = 10,
    windowMinutes: number = 5
  ): Promise<boolean> {
    try {
      const rateLimitResult = await rateLimiter.checkRateLimit(userId, {
        maxRequests: maxMessages,
        windowMs: windowMinutes * 60 * 1000,
        prefix: "user_rate_limit",
      });

      return rateLimitResult.allowed;
    } catch (error) {
      Logger.error("Error checking rate limit", error);
      return true; // Permitir en caso de error
    }
  }

  detectSuspiciousPatterns(message: string, userHistory: any[]): string[] {
    const patterns: string[] = [];
    const normalizedMessage = message.toLowerCase();

    // Detectar patrones sospechosos
    if (
      normalizedMessage.includes("password") ||
      normalizedMessage.includes("contraseña")
    ) {
      patterns.push("password_request");
    }

    if (
      normalizedMessage.includes("credit card") ||
      normalizedMessage.includes("tarjeta")
    ) {
      patterns.push("credit_card_request");
    }

    if (
      normalizedMessage.includes("social security") ||
      normalizedMessage.includes("seguridad social")
    ) {
      patterns.push("ssn_request");
    }

    // Detectar intentos de inyección
    if (
      normalizedMessage.includes("script") ||
      normalizedMessage.includes("<script>")
    ) {
      patterns.push("script_injection");
    }

    // Detectar comandos de sistema
    if (
      normalizedMessage.includes("rm -rf") ||
      normalizedMessage.includes("del /s")
    ) {
      patterns.push("system_command");
    }

    return patterns;
  }

  private updateUserBehavior(
    userId: string,
    message: string,
    abuseCheck: AbuseCheck
  ): void {
    const behavior = this.userBehaviors.get(userId) || {
      userId,
      messageCount: 0,
      averageMessageLength: 0,
      timeBetweenMessages: 0,
      repeatedPatterns: [],
      suspiciousActivity: [],
      lastActivity: new Date(),
      riskScore: 0,
    };

    // Actualizar estadísticas
    behavior.messageCount++;
    behavior.averageMessageLength =
      (behavior.averageMessageLength * (behavior.messageCount - 1) +
        message.length) /
      behavior.messageCount;
    behavior.lastActivity = new Date();

    // Actualizar patrones sospechosos
    if (abuseCheck.isAbusive) {
      behavior.suspiciousActivity.push(abuseCheck.reasons.join(", "));
    }

    // Calcular score de riesgo
    behavior.riskScore = this.calculateRiskScore(behavior, abuseCheck);

    this.userBehaviors.set(userId, behavior);
  }

  private calculateRiskScore(
    behavior: UserBehavior,
    abuseCheck: AbuseCheck
  ): number {
    let score = 0;

    // Factor por mensajes abusivos
    if (abuseCheck.isAbusive) {
      score += abuseCheck.confidence * 0.4;
    }

    // Factor por actividad sospechosa
    score += Math.min(behavior.suspiciousActivity.length * 0.1, 0.3);

    // Factor por velocidad de mensajes
    if (behavior.messageCount > 50) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  blockUser(userId: string, reason: string): void {
    this.blockedUsers.add(userId);
    Logger.warn("User blocked", { userId, reason });
  }

  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    Logger.info("User unblocked", { userId });
  }

  getUserBehavior(userId: string): UserBehavior | null {
    return this.userBehaviors.get(userId) || null;
  }

  getAbuseStats(): {
    totalUsers: number;
    blockedUsers: number;
    highRiskUsers: number;
    averageRiskScore: number;
  } {
    const totalUsers = this.userBehaviors.size;
    const blockedUsers = this.blockedUsers.size;
    const highRiskUsers = Array.from(this.userBehaviors.values()).filter(
      (b) => b.riskScore > 0.7
    ).length;
    const averageRiskScore =
      totalUsers > 0
        ? Array.from(this.userBehaviors.values()).reduce(
            (sum, b) => sum + b.riskScore,
            0
          ) / totalUsers
        : 0;

    return {
      totalUsers,
      blockedUsers,
      highRiskUsers,
      averageRiskScore,
    };
  }

  cleanupOldData(maxAgeDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    for (const [userId, behavior] of this.userBehaviors.entries()) {
      if (behavior.lastActivity < cutoffDate) {
        this.userBehaviors.delete(userId);
      }
    }

    Logger.info("Cleaned up old user behavior data", {
      maxAgeDays,
      remainingUsers: this.userBehaviors.size,
    });
  }

  private hashMessage(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Exportar instancia singleton
export const abuseDetection = AbuseDetection.getInstance();

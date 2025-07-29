import { cacheManager } from "./cacheManager";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // en milisegundos
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private static instance: RateLimiter;

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Verifica si una solicitud está dentro de los límites de velocidad
   */
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const cacheKey = `rate_limit:${identifier}`;
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;

    try {
      // Incrementar contador en caché distribuido
      const currentCount = await cacheManager.increment(cacheKey, 1, {
        ttl: Math.ceil(windowMs / 1000),
        prefix: config.prefix || "rate_limits",
      });

      // Si es el primer request, establecer expiración
      if (currentCount === 1) {
        await cacheManager.expire(cacheKey, Math.ceil(windowMs / 1000), {
          prefix: config.prefix || "rate_limits",
        });
      }

      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = now + windowMs;
      const allowed = currentCount <= maxRequests;

      const result: RateLimitResult = {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000),
      };

      return result;
    } catch (error) {
      console.error("Rate limit error:", error);

      // Fallback: permitir la solicitud en caso de error
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }
  }

  /**
   * Obtiene información sobre el estado actual del rate limit
   */
  async getRateLimitInfo(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const cacheKey = `rate_limit:${identifier}`;

    try {
      const currentCount =
        (await cacheManager.get<number>(cacheKey, {
          prefix: config.prefix || "rate_limits",
        })) || 0;

      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetTime = now + config.windowMs;

      return {
        allowed: currentCount < config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error("Get rate limit info error:", error);
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }
  }

  /**
   * Resetea el rate limit para un identificador específico
   */
  async resetRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<void> {
    const cacheKey = `rate_limit:${identifier}`;

    try {
      await cacheManager.delete(cacheKey, {
        prefix: config.prefix || "rate_limits",
      });
    } catch (error) {
      console.error("Reset rate limit error:", error);
    }
  }

  /**
   * Configuración predefinida para diferentes tipos de límites
   */
  static getPresetConfig(
    type: "strict" | "normal" | "lenient"
  ): RateLimitConfig {
    switch (type) {
      case "strict":
        return {
          maxRequests: 5,
          windowMs: 60 * 1000, // 1 minuto
          prefix: "rate_limit_strict",
        };
      case "normal":
        return {
          maxRequests: 20,
          windowMs: 5 * 60 * 1000, // 5 minutos
          prefix: "rate_limit_normal",
        };
      case "lenient":
        return {
          maxRequests: 100,
          windowMs: 15 * 60 * 1000, // 15 minutos
          prefix: "rate_limit_lenient",
        };
      default:
        return {
          maxRequests: 20,
          windowMs: 5 * 60 * 1000,
          prefix: "rate_limit_default",
        };
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();

import Redis from "ioredis";
import { LRUCache } from "lru-cache";
import Redlock from "redlock";
import client from "prom-client";

// Interfaces mejoradas
export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  lockTimeout?: number;
  retryAttempts?: number;
}

export interface CacheStats {
  redisConnected: boolean;
  localCacheSize: number;
  localCacheMaxSize: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  averageResponseTime: number;
  totalOperations: number;
  failedOperations: number;
  lockAcquisitions: number;
  lockFailures: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  totalOperations: number;
  failedOperations: number;
  memoryUsage: number;
  lockAcquisitions: number;
  lockFailures: number;
}

// Logger estructurado
class Logger {
  static info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        component: "CacheManager",
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
        component: "CacheManager",
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
        component: "CacheManager",
        message,
        ...data,
      })
    );
  }
}

// Métricas Prometheus
const cacheHitCounter = new client.Counter({
  name: "cache_hits_total",
  help: "Total cache hits",
  labelNames: ["cache_type", "prefix"],
});

const cacheMissCounter = new client.Counter({
  name: "cache_misses_total",
  help: "Total cache misses",
  labelNames: ["cache_type", "prefix"],
});

const cacheOperationDuration = new client.Histogram({
  name: "cache_operation_duration_seconds",
  help: "Cache operation duration in seconds",
  labelNames: ["operation", "cache_type"],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const cacheSizeGauge = new client.Gauge({
  name: "cache_size",
  help: "Current cache size",
  labelNames: ["cache_type"],
});

const lockAcquisitionCounter = new client.Counter({
  name: "cache_lock_acquisitions_total",
  help: "Total lock acquisitions",
  labelNames: ["status"],
});

const redisConnectionGauge = new client.Gauge({
  name: "redis_connection_status",
  help: "Redis connection status (1 = connected, 0 = disconnected)",
});

export class CacheManager {
  cleanupLocalCache() {
    try {
      // Limpiar caché local
      this.localCache.clear();
      Logger.info("Caché local limpiado exitosamente");
    } catch (error) {
      Logger.error("Error limpiando caché local", { error });
    }
  }
  private static instance: CacheManager;
  private redis: Redis | null = null;
  private redlock: Redlock | null = null;
  private isRedisConnected: boolean = false;
  private defaultTTL: number = 3600; // 1 hora por defecto
  private retryAttempts: number = 3;
  private lockTimeout: number = 2000; // 2 segundos

  // Caché local avanzada con LRU
  private localCache: LRUCache<string, any>;

  // Métricas internas
  private metrics: {
    hits: number;
    misses: number;
    totalOperations: number;
    failedOperations: number;
    totalResponseTime: number;
    lockAcquisitions: number;
    lockFailures: number;
  } = {
    hits: 0,
    misses: 0,
    totalOperations: 0,
    failedOperations: 0,
    totalResponseTime: 0,
    lockAcquisitions: 0,
    lockFailures: 0,
  };

  private constructor() {
    // Inicializar caché local con LRU
    this.localCache = new LRUCache<string, any>({
      max: 5000, // Máximo 5000 items
      ttl: 3600_000, // 1 hora por defecto
      updateAgeOnGet: true, // Actualizar edad al acceder
      allowStale: false, // No permitir datos obsoletos
      dispose: (key: string, value: any) => {
        Logger.info("Item expirado del caché local", {
          key,
          valueType: typeof value,
        });
      },
    });

    // Deshabilitar temporalmente Redis para evitar errores
    // this.initializeRedis();
    this.startMetricsCollection();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Inicializar Redis con backoff exponencial y configuración robusta
   */
  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Reintentos ilimitados
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000); // Hasta 3 segundos máximo
          Logger.warn(`Redis retry attempt ${times}`, { delay });
          return delay;
        },
        connectTimeout: 10000, // 10 segundos para conexiones lentas
        commandTimeout: 5000, // 5 segundos timeout para comandos
        lazyConnect: true, // Conectar solo cuando sea necesario
        keepAlive: 30000, // Keep-alive cada 30 segundos
        family: 4, // Forzar IPv4
        db: 0, // Base de datos por defecto
      });

      // Configurar event listeners
      this.redis.on("connect", () => {
        this.isRedisConnected = true;
        redisConnectionGauge.set(1);
        Logger.info("Redis conectado exitosamente");
        this.initializeRedlock();
      });

      this.redis.on("ready", () => {
        Logger.info("Redis listo para operaciones");
      });

      this.redis.on("error", (error: Error) => {
        this.isRedisConnected = false;
        redisConnectionGauge.set(0);
        Logger.error("Error de Redis", { error: error.message });
        this.handleCriticalError(error);
      });

      this.redis.on("close", () => {
        this.isRedisConnected = false;
        redisConnectionGauge.set(0);
        Logger.warn("Conexión de Redis cerrada");
      });

      this.redis.on("reconnecting", (delay: number) => {
        Logger.info("Reconectando a Redis", { delay });
      });

      // Conectar a Redis
      await this.redis.connect();
    } catch (error) {
      Logger.error("Error inicializando Redis", { error });
      this.handleCriticalError(error as Error);
    }
  }

  /**
   * Inicializar Redlock para control de concurrencia
   */
  private initializeRedlock(): void {
    if (!this.redis) return;

    try {
      this.redlock = new Redlock([this.redis], {
        retryCount: 5,
        retryDelay: 200, // 200ms entre reintentos
        retryJitter: 50, // Jitter para evitar thundering herd
        automaticExtensionThreshold: 500, // Extender automáticamente si queda menos de 500ms
      });

      this.redlock.on("error", (error: Error) => {
        Logger.error("Error de Redlock", { error: error.message });
      });

      Logger.info("Redlock inicializado exitosamente");
    } catch (error) {
      Logger.error("Error inicializando Redlock", { error });
    }
  }

  /**
   * Obtener valor del caché con serialización segura
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const cacheType = this.isRedisConnected ? "redis" : "local";

    try {
      this.metrics.totalOperations++;

      // Intentar obtener de Redis primero
      if (this.isRedisConnected && this.redis) {
        try {
          const value = await this.redis.get(fullKey);

          if (value !== null) {
            // Serialización segura con try-catch
            try {
              const parsedValue = JSON.parse(value) as T;
              this.recordHit(cacheType, options.prefix);
              this.recordMetrics(startTime, "get", cacheType);
              return parsedValue;
            } catch (parseError) {
              Logger.error(
                `Error parseando JSON de Redis para key ${fullKey}`,
                { parseError }
              );
              // Eliminar dato corrupto
              await this.redis.del(fullKey);
              this.recordMiss(cacheType, options.prefix);
            }
          } else {
            this.recordMiss(cacheType, options.prefix);
          }
        } catch (redisError) {
          Logger.error(`Error obteniendo de Redis para key ${fullKey}`, {
            redisError,
          });
          this.recordMiss(cacheType, options.prefix);
        }
      }

      // Fallback a caché local
      const localValue = this.localCache.get(fullKey);
      if (localValue !== undefined) {
        this.recordHit("local", options.prefix);
        this.recordMetrics(startTime, "get", "local");
        return localValue as T;
      }

      this.recordMiss("local", options.prefix);
      this.recordMetrics(startTime, "get", "local");
      return null;
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error en operación get", { key: fullKey, error });
      this.recordMetrics(startTime, "get", cacheType);
      return null;
    }
  }

  /**
   * Establecer valor en caché con control de concurrencia
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const ttl = options.ttl || this.defaultTTL;
    const cacheType = this.isRedisConnected ? "redis" : "local";

    try {
      this.metrics.totalOperations++;

      // Serializar valor de forma segura
      const serializedValue = JSON.stringify(value);

      // Establecer en caché local
      this.localCache.set(fullKey, value, { ttl: ttl * 1000 });

      // Establecer en Redis si está disponible
      if (this.isRedisConnected && this.redis) {
        try {
          await this.redis.setex(fullKey, ttl, serializedValue);
        } catch (redisError) {
          Logger.error(`Error estableciendo en Redis para key ${fullKey}`, {
            redisError,
          });
        }
      }

      this.recordMetrics(startTime, "set", cacheType);
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error en operación set", { key: fullKey, error });
      this.recordMetrics(startTime, "set", cacheType);
    }
  }

  /**
   * Establecer valor con control de concurrencia usando Redlock
   */
  async setSafe<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.getFullKey(key, options.prefix);
    const lockTimeout = options.lockTimeout || this.lockTimeout;
    let lock: any = null;

    try {
      if (this.redlock) {
        lock = await this.redlock.acquire([`lock:${fullKey}`], lockTimeout);
        this.metrics.lockAcquisitions++;
        lockAcquisitionCounter.inc({ status: "success" });
      }

      await this.set(key, value, options);
    } catch (error) {
      if (error instanceof Error && error.name === "ResourceLockedError") {
        this.metrics.lockFailures++;
        lockAcquisitionCounter.inc({ status: "failed" });
        Logger.warn("No se pudo adquirir lock para operación segura", {
          key: fullKey,
        });
      } else {
        Logger.error("Error en operación setSafe", { key: fullKey, error });
      }
    } finally {
      if (lock) {
        try {
          await lock.release();
        } catch (releaseError) {
          Logger.error("Error liberando lock", { releaseError });
        }
      }
    }
  }

  /**
   * Eliminar valor del caché
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const cacheType = this.isRedisConnected ? "redis" : "local";

    try {
      this.metrics.totalOperations++;

      // Eliminar de caché local
      this.localCache.delete(fullKey);

      // Eliminar de Redis si está disponible
      if (this.isRedisConnected && this.redis) {
        try {
          await this.redis.del(fullKey);
        } catch (redisError) {
          Logger.error(`Error eliminando de Redis para key ${fullKey}`, {
            redisError,
          });
        }
      }

      this.recordMetrics(startTime, "delete", cacheType);
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error en operación delete", { key: fullKey, error });
      this.recordMetrics(startTime, "delete", cacheType);
    }
  }

  /**
   * Incrementar valor numérico
   */
  async increment(
    key: string,
    amount: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const cacheType = this.isRedisConnected ? "redis" : "local";

    try {
      this.metrics.totalOperations++;

      let newValue: number;

      // Incrementar en Redis si está disponible
      if (this.isRedisConnected && this.redis) {
        try {
          newValue = await this.redis.incrby(fullKey, amount);
        } catch (redisError) {
          Logger.error(`Error incrementando en Redis para key ${fullKey}`, {
            redisError,
          });
          // Fallback a caché local
          const currentValue = this.localCache.get(fullKey) || 0;
          newValue = currentValue + amount;
          this.localCache.set(fullKey, newValue);
        }
      } else {
        // Solo caché local
        const currentValue = this.localCache.get(fullKey) || 0;
        newValue = currentValue + amount;
        this.localCache.set(fullKey, newValue);
      }

      this.recordMetrics(startTime, "increment", cacheType);
      return newValue;
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error en operación increment", { key: fullKey, error });
      this.recordMetrics(startTime, "increment", cacheType);
      return 0;
    }
  }

  /**
   * Establecer tiempo de expiración
   */
  async expire(
    key: string,
    ttl: number,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const cacheType = this.isRedisConnected ? "redis" : "local";

    try {
      this.metrics.totalOperations++;

      // Actualizar TTL en caché local
      const value = this.localCache.get(fullKey);
      if (value !== undefined) {
        this.localCache.set(fullKey, value, { ttl: ttl * 1000 });
      }

      // Actualizar TTL en Redis si está disponible
      if (this.isRedisConnected && this.redis) {
        try {
          await this.redis.expire(fullKey, ttl);
        } catch (redisError) {
          Logger.error(
            `Error estableciendo expiración en Redis para key ${fullKey}`,
            { redisError }
          );
        }
      }

      this.recordMetrics(startTime, "expire", cacheType);
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error en operación expire", { key: fullKey, error });
      this.recordMetrics(startTime, "expire", cacheType);
    }
  }

  /**
   * Limpiar caché local
   */
  clear(): void {
    try {
      this.localCache.clear();
      Logger.info("Caché local limpiado");
    } catch (error) {
      Logger.error("Error limpiando caché local", { error });
    }
  }

  /**
   * Obtener estadísticas completas del caché
   */
  getStats(): CacheStats {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
    const averageResponseTime =
      this.metrics.totalOperations > 0
        ? this.metrics.totalResponseTime / this.metrics.totalOperations
        : 0;

    return {
      redisConnected: this.isRedisConnected,
      localCacheSize: this.localCache.size,
      localCacheMaxSize: this.localCache.max,
      cacheHits: this.metrics.hits,
      cacheMisses: this.metrics.misses,
      cacheHitRate: hitRate,
      averageResponseTime,
      totalOperations: this.metrics.totalOperations,
      failedOperations: this.metrics.failedOperations,
      lockAcquisitions: this.metrics.lockAcquisitions,
      lockFailures: this.metrics.lockFailures,
    };
  }

  /**
   * Obtener métricas para monitoreo
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
    const averageResponseTime =
      this.metrics.totalOperations > 0
        ? this.metrics.totalResponseTime / this.metrics.totalOperations
        : 0;

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate,
      averageResponseTime,
      totalOperations: this.metrics.totalOperations,
      failedOperations: this.metrics.failedOperations,
      memoryUsage: this.localCache.size * 1024, // Estimación en bytes
      lockAcquisitions: this.metrics.lockAcquisitions,
      lockFailures: this.metrics.lockFailures,
    };
  }

  /**
   * Configurar TTL por defecto
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
    Logger.info("TTL por defecto actualizado", { ttl });
  }

  /**
   * Configurar número de reintentos
   */
  setRetryAttempts(attempts: number): void {
    this.retryAttempts = attempts;
    Logger.info("Número de reintentos actualizado", { attempts });
  }

  /**
   * Configurar timeout de locks
   */
  setLockTimeout(timeout: number): void {
    this.lockTimeout = timeout;
    Logger.info("Timeout de locks actualizado", { timeout });
  }

  /**
   * Verificar salud del sistema
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    redis: boolean;
    localCache: boolean;
    redlock: boolean;
    details: string;
  }> {
    const checks = {
      redis: this.isRedisConnected,
      localCache: this.localCache.size < this.localCache.max * 0.9, // Menos del 90% de capacidad
      redlock: this.redlock !== null,
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: "healthy" | "degraded" | "unhealthy";
    let details: string;

    if (healthyChecks === totalChecks) {
      status = "healthy";
      details = "Todos los componentes funcionando correctamente";
    } else if (healthyChecks >= totalChecks * 0.5) {
      status = "degraded";
      details =
        "Algunos componentes tienen problemas pero el sistema es funcional";
    } else {
      status = "unhealthy";
      details = "Múltiples componentes fallando";
    }

    return { status, ...checks, details };
  }

  /**
   * Métodos privados de utilidad
   */
  private getFullKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  private recordHit(cacheType: string, prefix?: string): void {
    this.metrics.hits++;
    cacheHitCounter.inc({ cache_type: cacheType, prefix: prefix || "default" });
  }

  private recordMiss(cacheType: string, prefix?: string): void {
    this.metrics.misses++;
    cacheMissCounter.inc({
      cache_type: cacheType,
      prefix: prefix || "default",
    });
  }

  private recordMetrics(
    startTime: number,
    operation: string,
    cacheType: string
  ): void {
    const duration = Date.now() - startTime;
    this.metrics.totalResponseTime += duration;

    cacheOperationDuration
      .labels(operation, cacheType)
      .observe(duration / 1000); // Convertir a segundos
  }

  private handleCriticalError(error: Error): void {
    Logger.error("Error crítico en CacheManager", { error: error.message });

    // Aquí se podría integrar con sistemas de notificación externos
    // como Slack, email, etc.

    // Por ahora, solo log del error
    console.error("🚨 ERROR CRÍTICO EN CACHE MANAGER:", error);
  }

  private startMetricsCollection(): void {
    // Actualizar métricas de tamaño de caché cada 30 segundos
    setInterval(() => {
      cacheSizeGauge.set({ cache_type: "local" }, this.localCache.size);
      cacheSizeGauge.set(
        { cache_type: "redis" },
        this.isRedisConnected ? 1 : 0
      );
    }, 30000);
  }

  /**
   * Cerrar conexiones al destruir
   */
  async destroy(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      if (this.redlock) {
        await this.redlock.quit();
      }
      this.localCache.clear();
      Logger.info("CacheManager destruido correctamente");
    } catch (error) {
      Logger.error("Error destruyendo CacheManager", { error });
    }
  }
}

export const cacheManager = CacheManager.getInstance();

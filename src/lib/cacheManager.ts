import { LRUCache } from "lru-cache";

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

// CacheManager simplificado para desarrollo
export class CacheManager {
  private static instance: CacheManager;
  private defaultTTL: number = 3600; // 1 hora por defecto
  private retryAttempts: number = 3;
  private lockTimeout: number = 2000; // 2 segundos

  // Cache local usando LRU
  private localCache: LRUCache<string, any>;

  // Métricas
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
    // Configurar cache local
    this.localCache = new LRUCache({
      max: 1000, // Máximo 1000 elementos
      ttl: 1000 * 60 * 60, // 1 hora por defecto
      updateAgeOnGet: true,
      allowStale: false,
    });

    Logger.info("CacheManager inicializado con cache local");
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);

    try {
      this.metrics.totalOperations++;
      const value = this.localCache.get(fullKey);

      if (value !== undefined) {
        this.recordHit("local", options.prefix);
        this.recordMetrics(startTime, "get", "local");
        return value as T;
      } else {
        this.recordMiss("local", options.prefix);
        this.recordMetrics(startTime, "get", "local");
        return null;
      }
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error getting from cache", error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);
    const ttl = options.ttl || this.defaultTTL;

    try {
      this.metrics.totalOperations++;
      this.localCache.set(fullKey, value, { ttl: ttl * 1000 });
      this.recordMetrics(startTime, "set", "local");
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error setting cache", error);
    }
  }

  async setSafe<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    return this.set(key, value, options);
  }

  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);

    try {
      this.metrics.totalOperations++;
      this.localCache.delete(fullKey);
      this.recordMetrics(startTime, "delete", "local");
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error deleting from cache", error);
    }
  }

  async increment(
    key: string,
    amount: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);

    try {
      this.metrics.totalOperations++;
      const currentValue = this.localCache.get(fullKey) || 0;
      const newValue = (currentValue as number) + amount;
      this.localCache.set(fullKey, newValue, { ttl: (options.ttl || this.defaultTTL) * 1000 });
      this.recordMetrics(startTime, "increment", "local");
      return newValue;
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error incrementing cache", error);
      return 0;
    }
  }

  async expire(
    key: string,
    ttl: number,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.getFullKey(key, options.prefix);

    try {
      this.metrics.totalOperations++;
      const value = this.localCache.get(fullKey);
      if (value !== undefined) {
        this.localCache.set(fullKey, value, { ttl: ttl * 1000 });
      }
      this.recordMetrics(startTime, "expire", "local");
    } catch (error) {
      this.metrics.failedOperations++;
      Logger.error("Error setting expiration", error);
    }
  }

  clear(): void {
    try {
      this.localCache.clear();
      Logger.info("Cache local limpiado exitosamente");
    } catch (error) {
      Logger.error("Error clearing cache", error);
    }
  }

  getStats(): CacheStats {
    const hitRate = this.metrics.totalOperations > 0 
      ? (this.metrics.hits / this.metrics.totalOperations) * 100 
      : 0;

    return {
      redisConnected: false, // Siempre false en desarrollo
      localCacheSize: this.localCache.size,
      localCacheMaxSize: this.localCache.max,
      cacheHits: this.metrics.hits,
      cacheMisses: this.metrics.misses,
      cacheHitRate: hitRate,
      averageResponseTime: this.metrics.totalOperations > 0 
        ? this.metrics.totalResponseTime / this.metrics.totalOperations 
        : 0,
      totalOperations: this.metrics.totalOperations,
      failedOperations: this.metrics.failedOperations,
      lockAcquisitions: this.metrics.lockAcquisitions,
      lockFailures: this.metrics.lockFailures,
    };
  }

  getMetrics(): CacheMetrics {
    const hitRate = this.metrics.totalOperations > 0 
      ? (this.metrics.hits / this.metrics.totalOperations) * 100 
      : 0;

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: hitRate,
      averageResponseTime: this.metrics.totalOperations > 0 
        ? this.metrics.totalResponseTime / this.metrics.totalOperations 
        : 0,
      totalOperations: this.metrics.totalOperations,
      failedOperations: this.metrics.failedOperations,
      memoryUsage: this.localCache.size,
      lockAcquisitions: this.metrics.lockAcquisitions,
      lockFailures: this.metrics.lockFailures,
    };
  }

  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
    Logger.info("TTL por defecto actualizado", { ttl });
  }

  setRetryAttempts(attempts: number): void {
    this.retryAttempts = attempts;
    Logger.info("Número de reintentos actualizado", { attempts });
  }

  setLockTimeout(timeout: number): void {
    this.lockTimeout = timeout;
    Logger.info("Timeout de locks actualizado", { timeout });
  }

  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    redis: boolean;
    localCache: boolean;
    redlock: boolean;
    details: string;
  }> {
    try {
      // Verificar cache local
      const testKey = "health_check_test";
      const testValue = "test_value";
      
      await this.set(testKey, testValue, { ttl: 10 });
      const retrievedValue = await this.get(testKey);
      
      if (retrievedValue === testValue) {
        await this.delete(testKey);
        return {
          status: "healthy",
          redis: false,
          localCache: true,
          redlock: false,
          details: "Cache local funcionando correctamente",
        };
      } else {
        return {
          status: "degraded",
          redis: false,
          localCache: false,
          redlock: false,
          details: "Cache local no funciona correctamente",
        };
      }
    } catch (error) {
      return {
        status: "unhealthy",
        redis: false,
        localCache: false,
        redlock: false,
        details: `Error en health check: ${error}`,
      };
    }
  }

  private getFullKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  private recordHit(cacheType: string, prefix?: string): void {
    this.metrics.hits++;
  }

  private recordMiss(cacheType: string, prefix?: string): void {
    this.metrics.misses++;
  }

  private recordMetrics(
    startTime: number,
    operation: string,
    cacheType: string
  ): void {
    const duration = Date.now() - startTime;
    this.metrics.totalResponseTime += duration;
  }

  async destroy(): Promise<void> {
    try {
      this.localCache.clear();
      Logger.info("CacheManager destruido correctamente");
    } catch (error) {
      Logger.error("Error destroying CacheManager", error);
    }
  }
}

// Exportar instancia singleton
export const cacheManager = CacheManager.getInstance();

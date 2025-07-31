interface FallbackConfig {
  enabled: boolean;
  timeout: number;
  cacheDuration: number;
}

interface FallbackResult<T> {
  success: boolean;
  data?: T;
  source: 'primary' | 'fallback' | 'cache' | 'offline';
  error?: Error;
}

class FallbackManager {
  private config: FallbackConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config?: Partial<FallbackConfig>) {
    this.config = {
      enabled: true,
      timeout: 5000, // 5 segundos
      cacheDuration: 5 * 60 * 1000, // 5 minutos
      ...config
    };
  }

  // Ejecutar operación con fallback
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>,
    cacheKey?: string,
    context?: string
  ): Promise<FallbackResult<T>> {
    // Intentar obtener de cache primero
    if (cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        console.log(`📦 [FALLBACK] ${context || 'Operation'} - Using cached data`);
        return {
          success: true,
          data: cached,
          source: 'cache'
        };
      }
    }

    // Intentar operación principal
    try {
      const result = await this.withTimeout(primaryOperation(), this.config.timeout);
      
      // Guardar en cache si se especificó
      if (cacheKey) {
        this.setCache(cacheKey, result);
      }

      return {
        success: true,
        data: result,
        source: 'primary'
      };
    } catch (error) {
      console.warn(`⚠️ [FALLBACK] ${context || 'Operation'} - Primary operation failed:`, error);

      // Intentar fallback si está disponible
      if (fallbackOperation) {
        try {
          const fallbackResult = await this.withTimeout(fallbackOperation(), this.config.timeout);
          
          console.log(`🔄 [FALLBACK] ${context || 'Operation'} - Using fallback operation`);
          
          return {
            success: true,
            data: fallbackResult,
            source: 'fallback'
          };
        } catch (fallbackError) {
          console.error(`❌ [FALLBACK] ${context || 'Operation'} - Fallback also failed:`, fallbackError);
          
          return {
            success: false,
            error: fallbackError as Error,
            source: 'fallback'
          };
        }
      }

      return {
        success: false,
        error: error as Error,
        source: 'primary'
      };
    }
  }

  // Ejecutar con timeout
  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  }

  // Gestión de cache
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheDuration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Limpiar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Limpiar cache expirado
  cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.cacheDuration) {
        this.cache.delete(key);
      }
    }
  }

  // Configurar para diferentes tipos de servicios
  configureForFirebase(): FallbackManager {
    return new FallbackManager({
      enabled: true,
      timeout: 8000,
      cacheDuration: 10 * 60 * 1000 // 10 minutos para Firebase
    });
  }

  configureForAI(): FallbackManager {
    return new FallbackManager({
      enabled: true,
      timeout: 15000,
      cacheDuration: 30 * 60 * 1000 // 30 minutos para AI
    });
  }

  configureForCritical(): FallbackManager {
    return new FallbackManager({
      enabled: true,
      timeout: 3000,
      cacheDuration: 2 * 60 * 1000 // 2 minutos para operaciones críticas
    });
  }
}

// Instancia singleton
export const fallbackManager = new FallbackManager();

// Funciones de conveniencia
export const executeWithFirebaseFallback = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
  cacheKey?: string,
  context?: string
) => fallbackManager.configureForFirebase().executeWithFallback(
  primaryOperation, 
  fallbackOperation, 
  cacheKey, 
  context
);

export const executeWithAIFallback = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
  cacheKey?: string,
  context?: string
) => fallbackManager.configureForAI().executeWithFallback(
  primaryOperation, 
  fallbackOperation, 
  cacheKey, 
  context
);

export const executeWithCriticalFallback = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
  cacheKey?: string,
  context?: string
) => fallbackManager.configureForCritical().executeWithFallback(
  primaryOperation, 
  fallbackOperation, 
  cacheKey, 
  context
);

export default fallbackManager; 
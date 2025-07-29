export interface AbuseDetectionConfig {
  // Configuración de caché
  cache: {
    defaultTTL: number; // en segundos
    abuseCheckTTL: number;
    spamCheckTTL: number;
    rateLimitTTL: number;
  };

  // Configuración de rate limiting
  rateLimiting: {
    defaultMaxRequests: number;
    defaultWindowMs: number;
    strictMaxRequests: number;
    strictWindowMs: number;
    lenientMaxRequests: number;
    lenientWindowMs: number;
  };

  // Configuración de detección
  detection: {
    minConfidence: number;
    maxMessageLength: number;
    suspiciousKeywords: string[];
    maxLinksPerMessage: number;
    maxRepetitiveMessages: number;
  };

  // Configuración de monitoreo
  monitoring: {
    maxMetrics: number;
    maxErrorLog: number;
    cleanupIntervalMs: number;
    alertThresholds: {
      errorRate: number;
      slowOperationThreshold: number;
      successRateThreshold: number;
    };
  };

  // Configuración de Redis
  redis: {
    url: string;
    retryDelay: number;
    maxRetries: number;
    connectTimeout: number;
  };
}

export const defaultConfig: AbuseDetectionConfig = {
  cache: {
    defaultTTL: 3600, // 1 hora
    abuseCheckTTL: 3600, // 1 hora
    spamCheckTTL: 1800, // 30 minutos
    rateLimitTTL: 300, // 5 minutos
  },

  rateLimiting: {
    defaultMaxRequests: 20,
    defaultWindowMs: 5 * 60 * 1000, // 5 minutos
    strictMaxRequests: 5,
    strictWindowMs: 60 * 1000, // 1 minuto
    lenientMaxRequests: 100,
    lenientWindowMs: 15 * 60 * 1000, // 15 minutos
  },

  detection: {
    minConfidence: 0.7,
    maxMessageLength: 5000,
    suspiciousKeywords: [
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
      "urgent",
      "exclusive offer",
      "guaranteed",
      "no risk",
      "instant",
      "secret",
      "hidden",
      "revolutionary",
    ],
    maxLinksPerMessage: 3,
    maxRepetitiveMessages: 2,
  },

  monitoring: {
    maxMetrics: 1000,
    maxErrorLog: 100,
    cleanupIntervalMs: 10 * 60 * 1000, // 10 minutos
    alertThresholds: {
      errorRate: 0.1, // 10%
      slowOperationThreshold: 5000, // 5 segundos
      successRateThreshold: 0.9, // 90%
    },
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    retryDelay: 100,
    maxRetries: 3,
    connectTimeout: 5000,
  },
};

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AbuseDetectionConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AbuseDetectionConfig {
    // Cargar configuración desde variables de entorno
    const envConfig: Partial<AbuseDetectionConfig> = {};

    // Cache
    if (process.env.CACHE_DEFAULT_TTL) {
      envConfig.cache = {
        ...defaultConfig.cache,
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL),
      };
    }

    // Rate limiting
    if (process.env.RATE_LIMIT_DEFAULT_MAX_REQUESTS) {
      envConfig.rateLimiting = {
        ...defaultConfig.rateLimiting,
        defaultMaxRequests: parseInt(
          process.env.RATE_LIMIT_DEFAULT_MAX_REQUESTS
        ),
      };
    }

    // Detection
    if (process.env.DETECTION_MIN_CONFIDENCE) {
      envConfig.detection = {
        ...defaultConfig.detection,
        minConfidence: parseFloat(process.env.DETECTION_MIN_CONFIDENCE),
      };
    }

    // Redis
    if (process.env.REDIS_URL) {
      envConfig.redis = {
        ...defaultConfig.redis,
        url: process.env.REDIS_URL,
      };
    }

    return { ...defaultConfig, ...envConfig };
  }

  getConfig(): AbuseDetectionConfig {
    return this.config;
  }

  updateConfig(updates: Partial<AbuseDetectionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getCacheConfig() {
    return this.config.cache;
  }

  getRateLimitingConfig() {
    return this.config.rateLimiting;
  }

  getDetectionConfig() {
    return this.config.detection;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getRedisConfig() {
    return this.config.redis;
  }
}

export const configManager = ConfigManager.getInstance();

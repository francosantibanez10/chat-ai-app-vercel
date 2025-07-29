import { cacheManager } from "./cacheManager";

export interface PerformanceMetrics {
  timestamp: Date;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  cacheStatus: {
    redisConnected: boolean;
    localCacheSize: number;
  };
  abuseDetection: {
    totalChecks: number;
    abusiveDetected: number;
    spamDetected: number;
    averageResponseTime: number;
  };
  rateLimiting: {
    totalRequests: number;
    blockedRequests: number;
    averageResponseTime: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{ timestamp: Date; error: string; operation: string }>;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000;
  private errorLog: Array<{
    timestamp: Date;
    error: string;
    operation: string;
  }> = [];
  private maxErrorLog: number = 100;

  private constructor() {
    // Limpiar métricas antiguas periódicamente
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 10 * 60 * 1000); // Cada 10 minutos
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Registra una métrica de rendimiento
   */
  recordMetric(
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date(),
      operation,
      duration,
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);

    // Mantener solo las métricas más recientes
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Registrar errores por separado
    if (!success && error) {
      this.recordError(error, operation);
    }
  }

  /**
   * Registra un error
   */
  recordError(error: string, operation: string): void {
    const errorEntry = {
      timestamp: new Date(),
      error,
      operation,
    };

    this.errorLog.push(errorEntry);

    // Mantener solo los errores más recientes
    if (this.errorLog.length > this.maxErrorLog) {
      this.errorLog = this.errorLog.slice(-this.maxErrorLog);
    }
  }

  /**
   * Obtiene métricas por operación
   */
  getMetricsByOperation(
    operation: string,
    timeWindow?: number
  ): PerformanceMetrics[] {
    const now = Date.now();
    const windowMs = timeWindow || 24 * 60 * 60 * 1000; // 24 horas por defecto

    return this.metrics.filter(
      (metric) =>
        metric.operation === operation &&
        now - metric.timestamp.getTime() < windowMs
    );
  }

  /**
   * Calcula estadísticas de rendimiento
   */
  getPerformanceStats(
    operation?: string,
    timeWindow?: number
  ): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
  } {
    const metrics = operation
      ? this.getMetricsByOperation(operation, timeWindow)
      : this.metrics;

    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
      };
    }

    const successful = metrics.filter((m) => m.success);
    const failed = metrics.filter((m) => !m.success);
    const durations = metrics.map((m) => m.duration);

    return {
      totalOperations: metrics.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successful.length / metrics.length) * 100,
    };
  }

  /**
   * Obtiene el estado de salud del sistema
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const cacheStats = cacheManager.getStats();

    // Estadísticas de detección de abuso
    const abuseMetrics = this.getMetricsByOperation(
      "abuse_check",
      60 * 60 * 1000
    ); // 1 hora
    const spamMetrics = this.getMetricsByOperation(
      "spam_check",
      60 * 60 * 1000
    );
    const rateLimitMetrics = this.getMetricsByOperation(
      "rate_limit_check",
      60 * 60 * 1000
    );

    const abuseStats = this.getPerformanceStats("abuse_check", 60 * 60 * 1000);
    const rateLimitStats = this.getPerformanceStats(
      "rate_limit_check",
      60 * 60 * 1000
    );

    // Contar errores por tipo
    const errorsByType: Record<string, number> = {};
    this.errorLog.forEach((error) => {
      const errorType = error.error.split(":")[0] || "unknown";
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    });

    return {
      cacheStatus: {
        redisConnected: cacheStats.redisConnected,
        localCacheSize: cacheStats.localCacheSize,
      },
      abuseDetection: {
        totalChecks:
          abuseStats.totalOperations +
          this.getPerformanceStats("spam_check", 60 * 60 * 1000)
            .totalOperations,
        abusiveDetected: abuseMetrics.filter((m) => m.metadata?.isAbusive)
          .length,
        spamDetected: spamMetrics.filter((m) => m.metadata?.isSpam).length,
        averageResponseTime: abuseStats.averageDuration,
      },
      rateLimiting: {
        totalRequests: rateLimitStats.totalOperations,
        blockedRequests: rateLimitMetrics.filter((m) => !m.metadata?.allowed)
          .length,
        averageResponseTime: rateLimitStats.averageDuration,
      },
      errors: {
        total: this.errorLog.length,
        byType: errorsByType,
        recent: this.errorLog.slice(-10), // Últimos 10 errores
      },
    };
  }

  /**
   * Obtiene alertas del sistema
   */
  getAlerts(): Array<{
    level: "info" | "warning" | "error" | "critical";
    message: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }> {
    const alerts: Array<{
      level: "info" | "warning" | "error" | "critical";
      message: string;
      timestamp: Date;
      metadata?: Record<string, any>;
    }> = [];

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Verificar tasa de error alta
    const recentErrors = this.errorLog.filter(
      (e) => e.timestamp.getTime() > oneHourAgo
    );
    if (recentErrors.length > 10) {
      alerts.push({
        level: "warning",
        message: `Alta tasa de errores: ${recentErrors.length} errores en la última hora`,
        timestamp: new Date(),
        metadata: { errorCount: recentErrors.length },
      });
    }

    // Verificar rendimiento lento
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > oneHourAgo
    );
    const slowOperations = recentMetrics.filter((m) => m.duration > 5000); // Más de 5 segundos
    if (slowOperations.length > 5) {
      alerts.push({
        level: "warning",
        message: `${slowOperations.length} operaciones lentas detectadas en la última hora`,
        timestamp: new Date(),
        metadata: { slowOperations: slowOperations.length },
      });
    }

    // Verificar tasa de éxito baja
    const abuseStats = this.getPerformanceStats("abuse_check", 60 * 60 * 1000);
    if (abuseStats.successRate < 90) {
      alerts.push({
        level: "error",
        message: `Tasa de éxito baja en detección de abuso: ${abuseStats.successRate.toFixed(
          1
        )}%`,
        timestamp: new Date(),
        metadata: { successRate: abuseStats.successRate },
      });
    }

    return alerts;
  }

  /**
   * Limpia métricas antiguas
   */
  private cleanupOldMetrics(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > oneDayAgo
    );
    this.errorLog = this.errorLog.filter(
      (e) => e.timestamp.getTime() > oneDayAgo
    );
  }

  /**
   * Exporta métricas para análisis externo
   */
  exportMetrics(timeWindow?: number): {
    metrics: PerformanceMetrics[];
    errors: Array<{ timestamp: Date; error: string; operation: string }>;
    summary: {
      totalMetrics: number;
      totalErrors: number;
      timeRange: { start: Date; end: Date };
    };
  } {
    const now = Date.now();
    const windowMs = timeWindow || 24 * 60 * 60 * 1000;
    const startTime = new Date(now - windowMs);

    const filteredMetrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > now - windowMs
    );
    const filteredErrors = this.errorLog.filter(
      (e) => e.timestamp.getTime() > now - windowMs
    );

    return {
      metrics: filteredMetrics,
      errors: filteredErrors,
      summary: {
        totalMetrics: filteredMetrics.length,
        totalErrors: filteredErrors.length,
        timeRange: { start: startTime, end: new Date() },
      },
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

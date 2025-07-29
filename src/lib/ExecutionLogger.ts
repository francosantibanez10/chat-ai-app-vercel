import { z } from "zod";
import {
  CodeExecution,
  ExecutionContext,
  ExecutionResult,
  codeExecutionSchema,
} from "./codeExecutor/types";
import { cacheManager } from "./cacheManager";
import { performanceMonitor } from "./performanceMonitor";

// Logger estructurado
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(
      `[${this.context}] INFO: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  warn(message: string, data?: any): void {
    console.warn(
      `[${this.context}] WARN: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  error(message: string, error?: any): void {
    console.error(
      `[${this.context}] ERROR: ${message}`,
      error ? JSON.stringify(error, null, 2) : ""
    );
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[${this.context}] DEBUG: ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  }
}

// Schemas de validación
const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  level: z.enum(["info", "warn", "error", "debug"]),
  message: z.string(),
  userId: z.string(),
  sessionId: z.string().optional(),
  executionId: z.string().optional(),
  data: z.any().optional(),
  metadata: z
    .object({
      ip: z.string().optional(),
      userAgent: z.string().optional(),
      requestId: z.string().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

const auditTrailSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  resource: z.string(),
  timestamp: z.date(),
  details: z.any(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  success: z.boolean(),
});

export interface LogEntry extends z.infer<typeof logEntrySchema> {}
export interface AuditTrail extends z.infer<typeof auditTrailSchema> {}

export class ExecutionLogger {
  private static instance: ExecutionLogger;
  private logger: Logger;
  private logs: Map<string, LogEntry[]> = new Map();
  private auditTrails: Map<string, AuditTrail[]> = new Map();
  private maxLogsPerUser: number = 1000;
  private maxAuditTrailsPerUser: number = 500;
  private logRetentionDays: number = 30;

  private constructor() {
    this.logger = new Logger("ExecutionLogger");
    this.startCleanupInterval();
  }

  static getInstance(): ExecutionLogger {
    if (!ExecutionLogger.instance) {
      ExecutionLogger.instance = new ExecutionLogger();
    }
    return ExecutionLogger.instance;
  }

  async logExecution(
    execution: CodeExecution,
    context?: ExecutionContext,
    metadata?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
      duration?: number;
    }
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Validar execution con Zod
      const validatedExecution = codeExecutionSchema.parse(execution);

      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        level: "info",
        message: `Code execution completed`,
        userId: validatedExecution.userId,
        sessionId: context?.sessionId,
        executionId: validatedExecution.id,
        data: {
          language: validatedExecution.language,
          executionTime: validatedExecution.executionTime,
          memoryUsage: validatedExecution.memoryUsage,
          isSandboxed: validatedExecution.isSandboxed,
          hasError: !!validatedExecution.error,
        },
        metadata: {
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
          requestId: metadata?.requestId || context?.requestId,
          duration: metadata?.duration,
        },
      };

      await this.saveLogEntry(logEntry);
      await this.createAuditTrail(execution, context, metadata);

      // Registrar métricas
      performanceMonitor.recordMetric(
        "execution_logged",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: validatedExecution.userId,
          language: validatedExecution.language,
        }
      );

      this.logger.info(`Execution logged successfully`, {
        executionId: validatedExecution.id,
        userId: validatedExecution.userId,
        language: validatedExecution.language,
      });
    } catch (error) {
      this.logger.error(`Failed to log execution`, error);
      performanceMonitor.recordError(
        "execution_logging_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async logError(
    error: Error,
    context: {
      userId: string;
      sessionId?: string;
      executionId?: string;
      code?: string;
      language?: string;
    },
    metadata?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
    }
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        level: "error",
        message: error.message,
        userId: context.userId,
        sessionId: context.sessionId,
        executionId: context.executionId,
        data: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          code: context.code,
          language: context.language,
        },
        metadata: {
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
          requestId: metadata?.requestId,
        },
      };

      await this.saveLogEntry(logEntry);

      // Registrar métricas
      performanceMonitor.recordMetric(
        "error_logged",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: context.userId,
          language: context.language,
        }
      );

      this.logger.warn(`Error logged`, {
        userId: context.userId,
        executionId: context.executionId,
        error: error.message,
      });
    } catch (logError) {
      this.logger.error(`Failed to log error`, logError);
      performanceMonitor.recordError(
        "error_logging_failed",
        logError instanceof Error ? logError.message : "Unknown error"
      );
    }
  }

  async logSecurityEvent(
    event: {
      type:
        | "security_check"
        | "sanitization"
        | "blocked_execution"
        | "suspicious_pattern";
      details: any;
      severity: "low" | "medium" | "high" | "critical";
    },
    context: {
      userId: string;
      sessionId?: string;
      executionId?: string;
      code?: string;
      language?: string;
    },
    metadata?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
    }
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        level: event.severity === "critical" ? "error" : "warn",
        message: `Security event: ${event.type}`,
        userId: context.userId,
        sessionId: context.sessionId,
        executionId: context.executionId,
        data: {
          securityEvent: event,
          code: context.code,
          language: context.language,
        },
        metadata: {
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
          requestId: metadata?.requestId,
        },
      };

      await this.saveLogEntry(logEntry);

      // Crear audit trail específico para eventos de seguridad
      await this.createSecurityAuditTrail(event, context, metadata);

      // Registrar métricas
      performanceMonitor.recordMetric(
        "security_event_logged",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: context.userId,
          eventType: event.type,
          severity: event.severity,
        }
      );

      this.logger.warn(`Security event logged`, {
        userId: context.userId,
        eventType: event.type,
        severity: event.severity,
      });
    } catch (error) {
      this.logger.error(`Failed to log security event`, error);
      performanceMonitor.recordError(
        "security_event_logging_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async getUserLogs(
    userId: string,
    options: {
      level?: "info" | "warn" | "error" | "debug";
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<LogEntry[]> {
    const startTime = Date.now();

    try {
      // Intentar obtener del cache primero
      const cacheKey = `user_logs:${userId}:${JSON.stringify(options)}`;
      const cached = await cacheManager.get<LogEntry[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let userLogs = this.logs.get(userId) || [];

      // Filtrar por nivel
      if (options.level) {
        userLogs = userLogs.filter((log) => log.level === options.level);
      }

      // Filtrar por fecha
      if (options.startDate) {
        userLogs = userLogs.filter(
          (log) => log.timestamp >= options.startDate!
        );
      }
      if (options.endDate) {
        userLogs = userLogs.filter((log) => log.timestamp <= options.endDate!);
      }

      // Ordenar por timestamp (más reciente primero)
      userLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Aplicar paginación
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const paginatedLogs = userLogs.slice(offset, offset + limit);

      // Cachear resultado
      await cacheManager.set(cacheKey, paginatedLogs, { ttl: 300 }); // 5 minutos

      // Registrar métricas
      performanceMonitor.recordMetric(
        "user_logs_retrieved",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId,
          count: paginatedLogs.length,
        }
      );

      return paginatedLogs;
    } catch (error) {
      this.logger.error(`Failed to get user logs`, error);
      performanceMonitor.recordError(
        "user_logs_retrieval_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return [];
    }
  }

  async getAuditTrail(
    userId: string,
    options: {
      action?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditTrail[]> {
    const startTime = Date.now();

    try {
      // Intentar obtener del cache primero
      const cacheKey = `audit_trail:${userId}:${JSON.stringify(options)}`;
      const cached = await cacheManager.get<AuditTrail[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let userAuditTrails = this.auditTrails.get(userId) || [];

      // Filtrar por acción
      if (options.action) {
        userAuditTrails = userAuditTrails.filter(
          (trail) => trail.action === options.action
        );
      }

      // Filtrar por fecha
      if (options.startDate) {
        userAuditTrails = userAuditTrails.filter(
          (trail) => trail.timestamp >= options.startDate!
        );
      }
      if (options.endDate) {
        userAuditTrails = userAuditTrails.filter(
          (trail) => trail.timestamp <= options.endDate!
        );
      }

      // Ordenar por timestamp (más reciente primero)
      userAuditTrails.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      // Aplicar paginación
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const paginatedTrails = userAuditTrails.slice(offset, offset + limit);

      // Cachear resultado
      await cacheManager.set(cacheKey, paginatedTrails, { ttl: 300 }); // 5 minutos

      // Registrar métricas
      performanceMonitor.recordMetric(
        "audit_trail_retrieved",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId,
          count: paginatedTrails.length,
        }
      );

      return paginatedTrails;
    } catch (error) {
      this.logger.error(`Failed to get audit trail`, error);
      performanceMonitor.recordError(
        "audit_trail_retrieval_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return [];
    }
  }

  async exportLogs(
    userId: string,
    format: "json" | "csv" = "json",
    options: {
      startDate?: Date;
      endDate?: Date;
      includeAuditTrail?: boolean;
    } = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const logs = await this.getUserLogs(userId, {
        startDate: options.startDate,
        endDate: options.endDate,
        limit: 10000, // Máximo para exportación
      });

      let exportData: any = { logs };

      if (options.includeAuditTrail) {
        const auditTrail = await this.getAuditTrail(userId, {
          startDate: options.startDate,
          endDate: options.endDate,
          limit: 10000,
        });
        exportData.auditTrail = auditTrail;
      }

      let result: string;

      if (format === "json") {
        result = JSON.stringify(exportData, null, 2);
      } else if (format === "csv") {
        result = this.convertToCSV(exportData);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }

      // Registrar métricas
      performanceMonitor.recordMetric(
        "logs_exported",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId,
          format,
          size: result.length,
        }
      );

      this.logger.info(`Logs exported successfully`, {
        userId,
        format,
        logCount: logs.length,
        size: result.length,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to export logs`, error);
      performanceMonitor.recordError(
        "logs_export_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }

  async getLogStats(userId?: string): Promise<{
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsByDay: Record<string, number>;
    averageLogsPerDay: number;
    mostActiveHour: number;
    errorRate: number;
  }> {
    const startTime = Date.now();

    try {
      let allLogs: LogEntry[] = [];

      if (userId) {
        allLogs = this.logs.get(userId) || [];
      } else {
        // Obtener todos los logs de todos los usuarios
        for (const userLogs of this.logs.values()) {
          allLogs.push(...userLogs);
        }
      }

      const logsByLevel: Record<string, number> = {};
      const logsByDay: Record<string, number> = {};
      const logsByHour: Record<number, number> = {};
      let errorCount = 0;

      allLogs.forEach((log) => {
        // Contar por nivel
        logsByLevel[log.level] = (logsByLevel[log.level] || 0) + 1;

        // Contar por día
        const dayKey = log.timestamp.toISOString().split("T")[0];
        logsByDay[dayKey] = (logsByDay[dayKey] || 0) + 1;

        // Contar por hora
        const hour = log.timestamp.getHours();
        logsByHour[hour] = (logsByHour[hour] || 0) + 1;

        // Contar errores
        if (log.level === "error") {
          errorCount++;
        }
      });

      // Encontrar la hora más activa
      const mostActiveHour =
        Object.entries(logsByHour).sort(([, a], [, b]) => b - a)[0]?.[0] || 0;

      // Calcular estadísticas
      const totalLogs = allLogs.length;
      const daysWithLogs = Object.keys(logsByDay).length;
      const averageLogsPerDay = daysWithLogs > 0 ? totalLogs / daysWithLogs : 0;
      const errorRate = totalLogs > 0 ? errorCount / totalLogs : 0;

      const stats = {
        totalLogs,
        logsByLevel,
        logsByDay,
        averageLogsPerDay,
        mostActiveHour: parseInt(mostActiveHour.toString()),
        errorRate,
      };

      // Registrar métricas
      performanceMonitor.recordMetric(
        "log_stats_retrieved",
        Date.now() - startTime,
        true,
        undefined,
        {
          userId: userId || "all",
          totalLogs,
        }
      );

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get log stats`, error);
      performanceMonitor.recordError(
        "log_stats_retrieval_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      return {
        totalLogs: 0,
        logsByLevel: {},
        logsByDay: {},
        averageLogsPerDay: 0,
        mostActiveHour: 0,
        errorRate: 0,
      };
    }
  }

  async cleanupOldLogs(): Promise<void> {
    const startTime = Date.now();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);

      let totalCleaned = 0;

      // Limpiar logs antiguos
      for (const [userId, userLogs] of this.logs.entries()) {
        const originalCount = userLogs.length;
        const filteredLogs = userLogs.filter(
          (log) => log.timestamp >= cutoffDate
        );

        if (filteredLogs.length !== originalCount) {
          this.logs.set(userId, filteredLogs);
          totalCleaned += originalCount - filteredLogs.length;
        }

        // Limitar logs por usuario
        if (filteredLogs.length > this.maxLogsPerUser) {
          const sortedLogs = filteredLogs.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          );
          this.logs.set(userId, sortedLogs.slice(0, this.maxLogsPerUser));
        }
      }

      // Limpiar audit trails antiguos
      for (const [userId, userAuditTrails] of this.auditTrails.entries()) {
        const originalCount = userAuditTrails.length;
        const filteredTrails = userAuditTrails.filter(
          (trail) => trail.timestamp >= cutoffDate
        );

        if (filteredTrails.length !== originalCount) {
          this.auditTrails.set(userId, filteredTrails);
          totalCleaned += originalCount - filteredTrails.length;
        }

        // Limitar audit trails por usuario
        if (filteredTrails.length > this.maxAuditTrailsPerUser) {
          const sortedTrails = filteredTrails.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          );
          this.auditTrails.set(
            userId,
            sortedTrails.slice(0, this.maxAuditTrailsPerUser)
          );
        }
      }

      // Registrar métricas
      performanceMonitor.recordMetric(
        "old_logs_cleaned",
        Date.now() - startTime,
        true,
        undefined,
        {
          totalCleaned,
        }
      );

      this.logger.info(`Cleanup completed`, {
        totalCleaned,
        retentionDays: this.logRetentionDays,
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup old logs`, error);
      performanceMonitor.recordError(
        "log_cleanup_failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private async saveLogEntry(logEntry: LogEntry): Promise<void> {
    try {
      // Validar con Zod
      const validatedEntry = logEntrySchema.parse(logEntry);

      // Guardar en memoria
      const userLogs = this.logs.get(validatedEntry.userId) || [];
      userLogs.push(validatedEntry);
      this.logs.set(validatedEntry.userId, userLogs);

      // Guardar en cache distribuido
      const cacheKey = `log_entry:${validatedEntry.id}`;
      await cacheManager.set(cacheKey, validatedEntry, { ttl: 86400 }); // 24 horas
    } catch (error) {
      this.logger.error(`Failed to save log entry`, error);
      throw error;
    }
  }

  private async createAuditTrail(
    execution: CodeExecution,
    context?: ExecutionContext,
    metadata?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
    }
  ): Promise<void> {
    try {
      const auditTrail: AuditTrail = {
        id: this.generateId(),
        userId: execution.userId,
        action: "code_execution",
        resource: `code:${execution.language}`,
        timestamp: new Date(),
        details: {
          executionId: execution.id,
          language: execution.language,
          executionTime: execution.executionTime,
          memoryUsage: execution.memoryUsage,
          isSandboxed: execution.isSandboxed,
          hasError: !!execution.error,
        },
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        success: !execution.error,
      };

      // Guardar en memoria
      const userAuditTrails = this.auditTrails.get(execution.userId) || [];
      userAuditTrails.push(auditTrail);
      this.auditTrails.set(execution.userId, userAuditTrails);

      // Guardar en cache distribuido
      const cacheKey = `audit_trail:${auditTrail.id}`;
      await cacheManager.set(cacheKey, auditTrail, { ttl: 86400 }); // 24 horas
    } catch (error) {
      this.logger.error(`Failed to create audit trail`, error);
    }
  }

  private async createSecurityAuditTrail(
    event: any,
    context: any,
    metadata?: any
  ): Promise<void> {
    try {
      const auditTrail: AuditTrail = {
        id: this.generateId(),
        userId: context.userId,
        action: `security_${event.type}`,
        resource: `code:${context.language}`,
        timestamp: new Date(),
        details: {
          eventType: event.type,
          severity: event.severity,
          details: event.details,
          executionId: context.executionId,
          code: context.code,
          language: context.language,
        },
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        success: event.severity !== "critical",
      };

      // Guardar en memoria
      const userAuditTrails = this.auditTrails.get(context.userId) || [];
      userAuditTrails.push(auditTrail);
      this.auditTrails.set(context.userId, userAuditTrails);

      // Guardar en cache distribuido
      const cacheKey = `audit_trail:${auditTrail.id}`;
      await cacheManager.set(cacheKey, auditTrail, { ttl: 86400 }); // 24 horas
    } catch (error) {
      this.logger.error(`Failed to create security audit trail`, error);
    }
  }

  private convertToCSV(data: any): string {
    if (!data.logs || data.logs.length === 0) {
      return "No logs found";
    }

    const headers = [
      "timestamp",
      "level",
      "message",
      "userId",
      "sessionId",
      "executionId",
    ];
    const csvRows = [headers.join(",")];

    data.logs.forEach((log: LogEntry) => {
      const row = [
        log.timestamp.toISOString(),
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.userId,
        log.sessionId || "",
        log.executionId || "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanupInterval(): void {
    // Ejecutar cleanup cada 6 horas
    setInterval(() => {
      this.cleanupOldLogs().catch((error) => {
        this.logger.error(`Cleanup interval failed`, error);
      });
    }, 6 * 60 * 60 * 1000);
  }

  configure(options: {
    maxLogsPerUser?: number;
    maxAuditTrailsPerUser?: number;
    logRetentionDays?: number;
  }): void {
    if (options.maxLogsPerUser !== undefined) {
      this.maxLogsPerUser = options.maxLogsPerUser;
    }
    if (options.maxAuditTrailsPerUser !== undefined) {
      this.maxAuditTrailsPerUser = options.maxAuditTrailsPerUser;
    }
    if (options.logRetentionDays !== undefined) {
      this.logRetentionDays = options.logRetentionDays;
    }

    this.logger.info(`Logger configured`, options);
  }

  getStats(): {
    totalUsers: number;
    totalLogs: number;
    totalAuditTrails: number;
    averageLogsPerUser: number;
    averageAuditTrailsPerUser: number;
  } {
    const totalUsers = this.logs.size;
    const totalLogs = Array.from(this.logs.values()).reduce(
      (sum, logs) => sum + logs.length,
      0
    );
    const totalAuditTrails = Array.from(this.auditTrails.values()).reduce(
      (sum, trails) => sum + trails.length,
      0
    );

    return {
      totalUsers,
      totalLogs,
      totalAuditTrails,
      averageLogsPerUser: totalUsers > 0 ? totalLogs / totalUsers : 0,
      averageAuditTrailsPerUser:
        totalUsers > 0 ? totalAuditTrails / totalUsers : 0,
    };
  }
}

export const executionLogger = ExecutionLogger.getInstance();

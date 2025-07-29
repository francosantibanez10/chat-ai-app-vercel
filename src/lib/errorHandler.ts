interface ErrorInfo {
  id: string;
  timestamp: Date;
  error: Error | string;
  context: {
    userId?: string;
    endpoint?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "validation"
    | "authentication"
    | "authorization"
    | "rate_limit"
    | "ai_error"
    | "system_error";
  metadata?: Record<string, any>;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
  };
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrors = 1000;

  // Crear un nuevo error
  createError(
    error: Error | string,
    context: ErrorInfo["context"],
    severity: ErrorInfo["severity"] = "medium",
    category: ErrorInfo["category"] = "system_error",
    metadata?: Record<string, any>
  ): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error,
      context,
      severity,
      category,
      metadata,
    };

    this.errors.push(errorInfo);
    this.cleanupOldErrors();
    this.logError(errorInfo);

    return errorInfo;
  }

  // Generar ID único para el error
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpiar errores antiguos
  private cleanupOldErrors(): void {
    if (this.errors.length > this.maxErrors) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
      this.errors = this.errors.filter((error) => error.timestamp > cutoff);
    }
  }

  // Log del error
  private logError(errorInfo: ErrorInfo): void {
    const errorMessage =
      typeof errorInfo.error === "string"
        ? errorInfo.error
        : errorInfo.error.message;

    console.error(
      `[${errorInfo.severity.toUpperCase()}] ${errorInfo.category}:`,
      {
        id: errorInfo.id,
        message: errorMessage,
        context: errorInfo.context,
        timestamp: errorInfo.timestamp,
        metadata: errorInfo.metadata,
      }
    );
  }

  // Crear respuesta de error para API
  createErrorResponse(
    error: Error | string,
    context: ErrorInfo["context"],
    severity: ErrorInfo["severity"] = "medium",
    category: ErrorInfo["category"] = "system_error"
  ): ErrorResponse {
    const errorInfo = this.createError(error, context, severity, category);

    const errorMessage = typeof error === "string" ? error : error.message;

    return {
      success: false,
      error: {
        code: this.getErrorCode(category),
        message: this.getUserFriendlyMessage(errorMessage, category),
        requestId: errorInfo.id,
      },
    };
  }

  // Obtener código de error basado en categoría
  private getErrorCode(category: ErrorInfo["category"]): string {
    const codes = {
      validation: "VALIDATION_ERROR",
      authentication: "AUTH_ERROR",
      authorization: "FORBIDDEN",
      rate_limit: "RATE_LIMIT_EXCEEDED",
      ai_error: "AI_SERVICE_ERROR",
      system_error: "INTERNAL_ERROR",
    };
    return codes[category];
  }

  // Obtener mensaje amigable para el usuario
  private getUserFriendlyMessage(
    errorMessage: string,
    category: ErrorInfo["category"]
  ): string {
    const messages = {
      validation: "Los datos proporcionados no son válidos.",
      authentication: "Necesitas iniciar sesión para acceder a este recurso.",
      authorization: "No tienes permisos para realizar esta acción.",
      rate_limit:
        "Has excedido el límite de requests. Intenta de nuevo más tarde.",
      ai_error: "Hubo un problema con el servicio de IA. Intenta de nuevo.",
      system_error:
        "Ocurrió un error interno. Nuestro equipo ha sido notificado.",
    };

    return messages[category] || "Ocurrió un error inesperado.";
  }

  // Obtener errores por severidad
  getErrorsBySeverity(severity: ErrorInfo["severity"]): ErrorInfo[] {
    return this.errors.filter((error) => error.severity === severity);
  }

  // Obtener errores por categoría
  getErrorsByCategory(category: ErrorInfo["category"]): ErrorInfo[] {
    return this.errors.filter((error) => error.category === category);
  }

  // Obtener errores recientes
  getRecentErrors(hours: number = 1): ErrorInfo[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.errors.filter((error) => error.timestamp > cutoff);
  }

  // Obtener estadísticas de errores
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorInfo["severity"], number>;
    byCategory: Record<ErrorInfo["category"], number>;
    recentErrors: number;
  } {
    const bySeverity = {
      low: this.getErrorsBySeverity("low").length,
      medium: this.getErrorsBySeverity("medium").length,
      high: this.getErrorsBySeverity("high").length,
      critical: this.getErrorsBySeverity("critical").length,
    };

    const byCategory = {
      validation: this.getErrorsByCategory("validation").length,
      authentication: this.getErrorsByCategory("authentication").length,
      authorization: this.getErrorsByCategory("authorization").length,
      rate_limit: this.getErrorsByCategory("rate_limit").length,
      ai_error: this.getErrorsByCategory("ai_error").length,
      system_error: this.getErrorsByCategory("system_error").length,
    };

    return {
      total: this.errors.length,
      bySeverity,
      byCategory,
      recentErrors: this.getRecentErrors(1).length,
    };
  }

  // Limpiar todos los errores
  clearErrors(): void {
    this.errors = [];
  }
}

// Instancia singleton
export const errorHandler = new ErrorHandler();

// Funciones de conveniencia
export const createError = (
  error: Error | string,
  context: ErrorInfo["context"],
  severity?: ErrorInfo["severity"],
  category?: ErrorInfo["category"],
  metadata?: Record<string, any>
) => errorHandler.createError(error, context, severity, category, metadata);

export const createErrorResponse = (
  error: Error | string,
  context: ErrorInfo["context"],
  severity?: ErrorInfo["severity"],
  category?: ErrorInfo["category"]
) => errorHandler.createErrorResponse(error, context, severity, category);

export const getErrorStats = () => errorHandler.getErrorStats();

import { useState, useEffect, useCallback } from "react";
import { retryFirebase, retryAI } from "@/lib/retryManager";
import {
  executeWithFirebaseFallback,
  executeWithAIFallback,
} from "@/lib/fallbackManager";
import { createError, getErrorStats } from "@/lib/errorHandler";
import { checkForAlerts, getActiveAlerts } from "@/lib/alertManager";
import {
  setOfflineCache,
  getOfflineCache,
  isOffline,
  getOfflineStats,
} from "@/lib/offlineManager";

interface ErrorHandlingConfig {
  enableRetry: boolean;
  enableFallbacks: boolean;
  enableAlerts: boolean;
  enableOfflineMode: boolean;
  autoRetry: boolean;
  maxRetryAttempts: number;
}

interface ErrorState {
  error: Error | string | null;
  type: "error" | "warning" | "info" | "network" | "auth" | "permission";
  isRetrying: boolean;
  retryCount: number;
  lastErrorTime: Date | null;
}

export const useErrorHandling = (config?: Partial<ErrorHandlingConfig>) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    type: "error",
    isRetrying: false,
    retryCount: 0,
    lastErrorTime: null,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [offlineStats, setOfflineStats] = useState(getOfflineStats());

  const defaultConfig: ErrorHandlingConfig = {
    enableRetry: true,
    enableFallbacks: true,
    enableAlerts: true,
    enableOfflineMode: true,
    autoRetry: true,
    maxRetryAttempts: 3,
    ...config,
  };

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🌐 [ERROR HANDLING] Conexión restaurada");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("📴 [ERROR HANDLING] Conexión perdida");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Actualizar estadísticas offline
  useEffect(() => {
    const interval = setInterval(() => {
      setOfflineStats(getOfflineStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Verificar alertas automáticamente
  useEffect(() => {
    if (!defaultConfig.enableAlerts) return;

    const interval = setInterval(() => {
      const errorStats = getErrorStats();
      const alerts = checkForAlerts(errorStats);

      if (alerts.length > 0) {
        console.log(`🚨 [ERROR HANDLING] ${alerts.length} alertas generadas`);
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [defaultConfig.enableAlerts]);

  // Función para manejar errores con retry automático
  const handleError = useCallback(
    async (
      error: Error | string,
      context: { userId?: string; endpoint?: string },
      options?: {
        type?: ErrorState["type"];
        severity?: "low" | "medium" | "high" | "critical";
        category?: string;
        retryable?: boolean;
        operation?: () => Promise<any>;
      }
    ) => {
      const {
        type = "error",
        severity = "medium",
        category = "system_error",
        retryable = true,
        operation,
      } = options || {};

      // Crear error estructurado
      createError(error, context, severity, category as any);

      // Determinar tipo de error
      let errorType: ErrorState["type"] = type;
      const errorMessage = typeof error === "string" ? error : error.message;

      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        errorType = "network";
      } else if (
        errorMessage.includes("auth") ||
        errorMessage.includes("permission")
      ) {
        errorType = "auth";
      } else if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("forbidden")
      ) {
        errorType = "permission";
      }

      // Si estamos offline, guardar en cache
      if (defaultConfig.enableOfflineMode && isOffline()) {
        await setOfflineCache(
          `error_${Date.now()}`,
          { error: errorMessage, context, timestamp: Date.now() },
          "settings"
        );
      }

      // Retry automático si está habilitado
      if (
        defaultConfig.autoRetry &&
        retryable &&
        operation &&
        errorState.retryCount < defaultConfig.maxRetryAttempts
      ) {
        setErrorState((prev) => ({
          ...prev,
          error,
          type: errorType,
          isRetrying: true,
          retryCount: prev.retryCount + 1,
          lastErrorTime: new Date(),
        }));

        try {
          // Esperar un poco antes de reintentar
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * errorState.retryCount)
          );

          const result = await operation();

          // Si el retry fue exitoso, limpiar el error
          setErrorState((prev) => ({
            ...prev,
            error: null,
            isRetrying: false,
          }));

          return result;
        } catch (retryError) {
          // Si el retry falló, mantener el error
          setErrorState((prev) => ({
            ...prev,
            error: retryError as Error,
            isRetrying: false,
          }));
        }
      } else {
        // No retry o máximo de intentos alcanzado
        setErrorState((prev) => ({
          ...prev,
          error,
          type: errorType,
          isRetrying: false,
          retryCount: 0,
          lastErrorTime: new Date(),
        }));
      }

      throw error;
    },
    [defaultConfig, errorState.retryCount]
  );

  // Función para ejecutar operaciones con retry y fallbacks
  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context: { userId?: string; endpoint?: string },
      options?: {
        type?: "firebase" | "ai" | "critical";
        fallback?: () => Promise<T>;
        cacheKey?: string;
        retryable?: boolean;
      }
    ): Promise<T> => {
      const {
        type = "firebase",
        fallback,
        cacheKey,
        retryable = true,
      } = options || {};

      try {
        if (type === "firebase" && defaultConfig.enableFallbacks) {
          const result = await executeWithFirebaseFallback(
            operation,
            fallback,
            cacheKey,
            context.endpoint
          );

          if (!result.success) {
            throw result.error || new Error("Operación fallida");
          }

          return result.data!;
        } else if (type === "ai" && defaultConfig.enableFallbacks) {
          const result = await executeWithAIFallback(
            operation,
            fallback,
            cacheKey,
            context.endpoint
          );

          if (!result.success) {
            throw result.error || new Error("Operación fallida");
          }

          return result.data!;
        } else if (defaultConfig.enableRetry) {
          const retryFunction = type === "ai" ? retryAI : retryFirebase;
          const result = await retryFunction(operation, context.endpoint);

          if (!result.success) {
            throw result.error || new Error("Operación fallida");
          }

          return result.data!;
        } else {
          // Sin retry ni fallbacks
          return await operation();
        }
      } catch (error) {
        return handleError(error as Error, context, {
          type: "error",
          retryable,
          operation: retryable ? operation : undefined,
        });
      }
    },
    [defaultConfig, handleError]
  );

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setErrorState((prev) => ({
      ...prev,
      error: null,
      isRetrying: false,
      retryCount: 0,
    }));
  }, []);

  // Función para obtener estadísticas
  const getStats = useCallback(() => {
    return {
      errorStats: getErrorStats(),
      activeAlerts: getActiveAlerts(),
      offlineStats,
      isOnline,
    };
  }, [offlineStats, isOnline]);

  return {
    // Estado
    error: errorState.error,
    errorType: errorState.type,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    isOnline,
    offlineStats,

    // Funciones
    handleError,
    executeWithErrorHandling,
    clearError,
    getStats,

    // Configuración
    config: defaultConfig,
  };
};

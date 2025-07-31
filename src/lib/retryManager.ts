interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

class RetryManager {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000, // 1 segundo
      maxDelay: 10000, // 10 segundos
      backoffMultiplier: 2,
      retryableErrors: [
        "network-error",
        "timeout",
        "unavailable",
        "resource-exhausted",
        "permission-denied",
        "unauthenticated",
        "quota-exceeded",
      ],
      ...config,
    };
  }

  // Función principal de retry
  async retry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    let lastError: Error;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;

        // Verificar si el error es retryable
        if (!this.isRetryableError(error as Error)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime: Date.now() - startTime,
          };
        }

        // Si es el último intento, no esperar
        if (attempt === this.config.maxAttempts) {
          break;
        }

        // Calcular delay con backoff exponencial
        const delay = this.calculateDelay(attempt);

        console.log(
          `🔄 [RETRY] ${context || "Operation"} - Attempt ${attempt}/${
            this.config.maxAttempts
          }, retrying in ${delay}ms`
        );

        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: this.config.maxAttempts,
      totalTime: Date.now() - startTime,
    };
  }

  // Verificar si un error es retryable
  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorCode = (error as any).code?.toLowerCase();

    return this.config.retryableErrors.some(
      (retryableError) =>
        errorMessage.includes(retryableError) ||
        errorCode?.includes(retryableError)
    );
  }

  // Calcular delay con backoff exponencial
  private calculateDelay(attempt: number): number {
    const delay =
      this.config.baseDelay *
      Math.pow(this.config.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  // Función de sleep
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Configurar retry para diferentes tipos de operaciones
  configureForFirebase(): RetryManager {
    return new RetryManager({
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      retryableErrors: [
        "network-error",
        "timeout",
        "unavailable",
        "resource-exhausted",
        "permission-denied",
        "unauthenticated",
        "quota-exceeded",
        "failed-precondition",
        "aborted",
        "deadline-exceeded",
      ],
    });
  }

  configureForAI(): RetryManager {
    return new RetryManager({
      maxAttempts: 2,
      baseDelay: 2000,
      maxDelay: 10000,
      retryableErrors: [
        "rate-limit",
        "timeout",
        "service-unavailable",
        "internal-error",
      ],
    });
  }

  configureForCritical(): RetryManager {
    return new RetryManager({
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 15000,
      retryableErrors: [
        "network-error",
        "timeout",
        "unavailable",
        "resource-exhausted",
      ],
    });
  }
}

// Instancia singleton
export const retryManager = new RetryManager();

// Funciones de conveniencia
export const retryFirebase = <T>(
  operation: () => Promise<T>,
  context?: string
) => retryManager.configureForFirebase().retry(operation, context);

export const retryAI = <T>(operation: () => Promise<T>, context?: string) =>
  retryManager.configureForAI().retry(operation, context);

export const retryCritical = <T>(
  operation: () => Promise<T>,
  context?: string
) => retryManager.configureForCritical().retry(operation, context);

export default retryManager;

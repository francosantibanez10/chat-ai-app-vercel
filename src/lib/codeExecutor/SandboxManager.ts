import ivm from "isolated-vm";
import { spawn, ChildProcess } from "child_process";
import { promisify } from "util";
import { ResourceLimits, SandboxConfig, CodeExecution } from "./types";
import { cacheManager } from "../cacheManager";
import { performanceMonitor } from "../performanceMonitor";

// Logger estructurado
class Logger {
  static info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        component: "SandboxManager",
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
        component: "SandboxManager",
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
        component: "SandboxManager",
        message,
        ...data,
      })
    );
  }
}

export class SandboxManager {
  private static instance: SandboxManager;
  private isolatedVMs: Map<string, ivm.Isolate> = new Map();
  private activeProcesses: Map<string, ChildProcess> = new Map();
  private defaultConfig: SandboxConfig;

  private constructor() {
    this.defaultConfig = {
      timeout: 5000,
      memoryLimit: 50,
      cpuLimit: 50,
      networkAccess: false,
      fileSystemAccess: false,
      allowedModules: [],
      blockedModules: [],
      environment: {},
    };
  }

  static getInstance(): SandboxManager {
    if (!SandboxManager.instance) {
      SandboxManager.instance = new SandboxManager();
    }
    return SandboxManager.instance;
  }

  /**
   * Ejecutar código JavaScript/TypeScript en sandbox aislado
   */
  async executeJavaScript(
    code: string,
    input: any,
    limits: ResourceLimits,
    userContext?: { userId: string; sessionId?: string }
  ): Promise<{ output: any; memoryUsage: number; error?: string }> {
    const startTime = Date.now();
    const executionId = `js_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Crear isolate aislado
      const isolate = new ivm.Isolate({
        memoryLimit: limits.maxMemoryUsage,
      });

      this.isolatedVMs.set(executionId, isolate);

      // Crear contexto
      const context = isolate.createContextSync();
      const jail = context.global;

      // Configurar entorno seguro
      await this.setupSecureEnvironment(jail, limits);

      // Envolver código con input
      const wrappedCode = this.wrapJavaScriptCode(code, input);

      // Ejecutar código
      const script = isolate.compileScriptSync(wrappedCode);
      const result = await script.run(context, {
        timeout: limits.maxExecutionTime,
      });

      // Obtener resultado
      const output = await result.copy();

      // Limpiar
      isolate.dispose();
      this.isolatedVMs.delete(executionId);

      const executionTime = Date.now() - startTime;

      // Registrar métricas
      performanceMonitor.recordMetric(
        "javascript_execution",
        executionTime,
        true,
        undefined,
        {
          executionId,
          memoryUsage: limits.maxMemoryUsage,
          userId: userContext?.userId || "unknown",
        }
      );

      Logger.info("JavaScript execution completed", {
        executionId,
        executionTime,
        outputSize: JSON.stringify(output).length,
      });

      return { output, memoryUsage: limits.maxMemoryUsage };
    } catch (error) {
      // Limpiar en caso de error
      const isolate = this.isolatedVMs.get(executionId);
      if (isolate) {
        isolate.dispose();
        this.isolatedVMs.delete(executionId);
      }

      Logger.error("JavaScript execution failed", { executionId, error });

      performanceMonitor.recordMetric(
        "javascript_execution",
        Date.now() - startTime,
        false,
        error instanceof Error ? error.message : "Unknown error",
        {
          executionId,
          userId: userContext?.userId || "unknown",
        }
      );

      return {
        output: null,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  /**
   * Ejecutar código Python en proceso aislado
   */
  async executePython(
    code: string,
    input: any,
    limits: ResourceLimits,
    userContext?: { userId: string; sessionId?: string }
  ): Promise<{ output: any; memoryUsage: number; error?: string }> {
    const startTime = Date.now();
    const executionId = `py_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Crear proceso Python aislado
      const pythonProcess = spawn("python3", ["-c", code], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PYTHONPATH: "",
          PYTHONUNBUFFERED: "1",
          PYTHONDONTWRITEBYTECODE: "1",
        },
        timeout: limits.maxExecutionTime,
      });

      this.activeProcesses.set(executionId, pythonProcess);

      // Enviar input si existe
      if (input) {
        pythonProcess.stdin?.write(JSON.stringify(input));
        pythonProcess.stdin?.end();
      }

      // Capturar output
      let stdout = "";
      let stderr = "";

      pythonProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      // Esperar finalización
      await new Promise<void>((resolve, reject) => {
        pythonProcess.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Python process exited with code ${code}`));
          }
        });

        pythonProcess.on("error", (error) => {
          reject(error);
        });

        // Timeout
        setTimeout(() => {
          reject(new Error("Python execution timeout"));
        }, limits.maxExecutionTime);
      });

      // Procesar output
      let output: any;
      try {
        output = stdout ? JSON.parse(stdout) : null;
      } catch {
        output = stdout || null;
      }

      // Limpiar
      this.activeProcesses.delete(executionId);

      const executionTime = Date.now() - startTime;

      // Registrar métricas
      performanceMonitor.recordMetric(
        "python_execution",
        executionTime,
        true,
        undefined,
        {
          executionId,
          memoryUsage: limits.maxMemoryUsage,
          userId: userContext?.userId || "unknown",
        }
      );

      Logger.info("Python execution completed", {
        executionId,
        executionTime,
        outputSize: JSON.stringify(output).length,
      });

      return { output, memoryUsage: limits.maxMemoryUsage };
    } catch (error) {
      // Terminar proceso en caso de error
      const process = this.activeProcesses.get(executionId);
      if (process) {
        process.kill("SIGKILL");
        this.activeProcesses.delete(executionId);
      }

      Logger.error("Python execution failed", { executionId, error });

      performanceMonitor.recordMetric(
        "python_execution",
        Date.now() - startTime,
        false,
        error instanceof Error ? error.message : "Unknown error",
        {
          executionId,
          userId: userContext?.userId || "unknown",
        }
      );

      return {
        output: null,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  /**
   * Ejecutar SQL (simulado en sandbox)
   */
  async executeSQL(
    code: string,
    input: any,
    limits: ResourceLimits,
    context?: { userId: string; sessionId?: string }
  ): Promise<{ output: any; memoryUsage: number; error?: string }> {
    const startTime = Date.now();
    const executionId = `sql_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Simulación de ejecución SQL en sandbox
      // En producción, usar una base de datos aislada
      const mockResult = {
        rows: [
          { id: 1, name: "Ejemplo 1", value: 100 },
          { id: 2, name: "Ejemplo 2", value: 200 },
        ],
        count: 2,
        query: code,
        executionTime: Date.now() - startTime,
      };

      // Simular procesamiento
      await new Promise((resolve) => setTimeout(resolve, 100));

      Logger.info("SQL execution completed", {
        executionId,
        executionTime: Date.now() - startTime,
      });

      return { output: mockResult, memoryUsage: 10 };
    } catch (error) {
      Logger.error("SQL execution failed", { executionId, error });
      return {
        output: null,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : "SQL execution failed",
      };
    }
  }

  /**
   * Ejecutar Bash en proceso aislado
   */
  async executeBash(
    code: string,
    input: any,
    limits: ResourceLimits,
    userContext?: { userId: string; sessionId?: string }
  ): Promise<{ output: any; memoryUsage: number; error?: string }> {
    const startTime = Date.now();
    const executionId = `bash_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Crear proceso Bash aislado
      const bashProcess = spawn("bash", ["-c", code], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PATH: "/usr/local/bin:/usr/bin:/bin",
          HOME: "/tmp",
          USER: "sandbox",
        },
        timeout: limits.maxExecutionTime,
        cwd: "/tmp",
      });

      this.activeProcesses.set(executionId, bashProcess);

      // Enviar input si existe
      if (input) {
        bashProcess.stdin?.write(JSON.stringify(input));
        bashProcess.stdin?.end();
      }

      // Capturar output
      let stdout = "";
      let stderr = "";

      bashProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      bashProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      // Esperar finalización
      await new Promise<void>((resolve, reject) => {
        bashProcess.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Bash process exited with code ${code}`));
          }
        });

        bashProcess.on("error", (error) => {
          reject(error);
        });

        // Timeout
        setTimeout(() => {
          reject(new Error("Bash execution timeout"));
        }, limits.maxExecutionTime);
      });

      const executionTime = Date.now() - startTime;

      Logger.info("Bash execution completed", {
        executionId,
        executionTime,
        stdoutSize: stdout.length,
        stderrSize: stderr.length,
      });

      performanceMonitor.recordMetric(
        "bash_execution",
        executionTime,
        true,
        undefined,
        {
          executionId,
          memoryUsage: limits.maxMemoryUsage,
          userId: userContext?.userId || "unknown",
        }
      );

      return {
        output: { stdout, stderr, exitCode: 0 },
        memoryUsage: limits.maxMemoryUsage,
      };
    } catch (error) {
      // Terminar proceso en caso de error
      const process = this.activeProcesses.get(executionId);
      if (process) {
        process.kill("SIGKILL");
        this.activeProcesses.delete(executionId);
      }

      Logger.error("Bash execution failed", { executionId, error });

      performanceMonitor.recordMetric(
        "bash_execution",
        Date.now() - startTime,
        false,
        error instanceof Error ? error.message : "Unknown error",
        {
          executionId,
          userId: userContext?.userId || "unknown",
        }
      );

      return {
        output: null,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : "Bash execution failed",
      };
    }
  }

  /**
   * Configurar entorno seguro para JavaScript
   */
  private async setupSecureEnvironment(
    jail: ivm.Reference<any>,
    limits: ResourceLimits
  ): Promise<void> {
    // Configurar funciones básicas seguras
    await jail.set("console", {
      log: (...args: any[]) => console.log("[Sandbox]", ...args),
      error: (...args: any[]) => console.error("[Sandbox]", ...args),
      warn: (...args: any[]) => console.warn("[Sandbox]", ...args),
    });

    // Configurar funciones matemáticas
    await jail.set("Math", {
      PI: Math.PI,
      E: Math.E,
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      random: Math.random,
      round: Math.round,
      sqrt: Math.sqrt,
    });

    // Configurar funciones de array
    await jail.set("Array", {
      isArray: Array.isArray,
      from: Array.from,
    });

    // Configurar funciones de string
    await jail.set("String", {
      fromCharCode: String.fromCharCode,
    });

    // Configurar JSON
    await jail.set("JSON", {
      parse: JSON.parse,
      stringify: JSON.stringify,
    });

    // Configurar funciones de fecha (limitadas)
    await jail.set("Date", {
      now: Date.now,
    });
  }

  /**
   * Envolver código JavaScript con contexto seguro
   */
  private wrapJavaScriptCode(code: string, input: any): string {
    return `
      (function(input) {
        'use strict';
        
        // Variables globales seguras
        const global = {};
        const window = undefined;
        const document = undefined;
        const process = undefined;
        const require = undefined;
        const module = undefined;
        const exports = undefined;
        const __dirname = undefined;
        const __filename = undefined;
        
        // Código del usuario
        ${code}
        
        // Retornar resultado
        return typeof result !== 'undefined' ? result : null;
      })(${JSON.stringify(input)});
    `;
  }

  /**
   * Verificar límites de recursos
   */
  private checkResourceLimits(
    executionTime: number,
    memoryUsage: number,
    limits: ResourceLimits
  ): void {
    if (executionTime > limits.maxExecutionTime) {
      throw new Error("Tiempo de ejecución excedido");
    }

    if (memoryUsage > limits.maxMemoryUsage) {
      throw new Error("Uso de memoria excedido");
    }
  }

  /**
   * Limpiar recursos
   */
  cleanup(): void {
    // Limpiar isolates
    for (const [id, isolate] of this.isolatedVMs.entries()) {
      try {
        isolate.dispose();
      } catch (error) {
        Logger.error("Error disposing isolate", { id, error });
      }
    }
    this.isolatedVMs.clear();

    // Terminar procesos activos
    for (const [id, process] of this.activeProcesses.entries()) {
      try {
        process.kill("SIGKILL");
      } catch (error) {
        Logger.error("Error killing process", { id, error });
      }
    }
    this.activeProcesses.clear();

    Logger.info("Sandbox cleanup completed");
  }

  /**
   * Obtener estadísticas del sandbox
   */
  getSandboxStats(): {
    activeIsolates: number;
    activeProcesses: number;
    totalMemoryUsage: number;
    averageExecutionTime: number;
  } {
    return {
      activeIsolates: this.isolatedVMs.size,
      activeProcesses: this.activeProcesses.size,
      totalMemoryUsage: 0, // Implementar cálculo real
      averageExecutionTime: 0, // Implementar cálculo real
    };
  }

  /**
   * Configurar sandbox
   */
  configureSandbox(config: Partial<SandboxConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    Logger.info("Sandbox configuration updated", {
      config: this.defaultConfig,
    });
  }

  /**
   * Verificar salud del sandbox
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    isolates: number;
    processes: number;
    memoryUsage: number;
    details: string;
  }> {
    const isolates = this.isolatedVMs.size;
    const processes = this.activeProcesses.size;
    const memoryUsage = 0; // Implementar cálculo real

    let status: "healthy" | "degraded" | "unhealthy";
    let details: string;

    if (isolates === 0 && processes === 0) {
      status = "healthy";
      details = "Sandbox limpio y listo";
    } else if (isolates <= 10 && processes <= 5) {
      status = "healthy";
      details = "Sandbox funcionando normalmente";
    } else if (isolates <= 50 && processes <= 20) {
      status = "degraded";
      details = "Sandbox con carga moderada";
    } else {
      status = "unhealthy";
      details = "Sandbox sobrecargado";
    }

    return { status, isolates, processes, memoryUsage, details };
  }
}

export const sandboxManager = SandboxManager.getInstance();

import { CodeExecutor } from "./CodeExecutor";
import { ExecutionLogger } from "./ExecutionLogger";
import { ExecutionAnalyzer } from "./ExecutionAnalyzer";
import { SandboxManager } from "./SandboxManager";
import { TestGenerator } from "./TestGenerator";
import { SecurityManager } from "./SecurityManager";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { CodeMemory } from "./CodeMemory";

// Exportar la instancia principal
export const codeExecutor = CodeExecutor.getInstance();

// Exportar módulos individuales para uso directo
export {
  CodeExecutor,
  ExecutionLogger,
  ExecutionAnalyzer,
  SandboxManager,
  TestGenerator,
  SecurityManager,
  PerformanceMonitor,
  CodeMemory,
};

// Exportar tipos
export * from "./types";

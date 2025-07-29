import { CodeExecutor } from "./codeExecutor/CodeExecutor";
import { ExecutionLogger } from "./ExecutionLogger";
import { ExecutionAnalyzer } from "./codeExecutor/ExecutionAnalyzer";
import { SandboxManager } from "./codeExecutor/SandboxManager";
import { TestGenerator } from "./TestGenerator";
import { SecurityManager } from "./codeExecutor/SecurityManager";
import { PerformanceMonitor } from "./performanceMonitor";
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
export * from "./codeExecutor/types";

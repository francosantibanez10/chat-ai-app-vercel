// Exportaciones condicionales para compatibilidad con diferentes entornos
let codeExecutor: any = null;
let CodeExecutor: any = null;
let ExecutionLogger: any = null;
let ExecutionAnalyzer: any = null;
let SandboxManager: any = null;
let TestGenerator: any = null;
let SecurityManager: any = null;
let PerformanceMonitor: any = null;
let CodeMemory: any = null;

// Intentar importar módulos de manera condicional
try {
  const codeExecutorModule = require("./codeExecutor/CodeExecutor");
  const executionLoggerModule = require("./ExecutionLogger");
  const executionAnalyzerModule = require("./codeExecutor/ExecutionAnalyzer");
  const sandboxManagerModule = require("./codeExecutor/SandboxManager");
  const testGeneratorModule = require("./TestGenerator");
  const securityManagerModule = require("./codeExecutor/SecurityManager");
  const performanceMonitorModule = require("./performanceMonitor");
  const codeMemoryModule = require("./CodeMemory");

  CodeExecutor = codeExecutorModule.CodeExecutor;
  ExecutionLogger = executionLoggerModule.ExecutionLogger;
  ExecutionAnalyzer = executionAnalyzerModule.ExecutionAnalyzer;
  SandboxManager = sandboxManagerModule.SandboxManager;
  TestGenerator = testGeneratorModule.TestGenerator;
  SecurityManager = securityManagerModule.SecurityManager;
  PerformanceMonitor = performanceMonitorModule.PerformanceMonitor;
  CodeMemory = codeMemoryModule.CodeMemory;

  // Exportar la instancia principal solo si está disponible
  if (CodeExecutor) {
    codeExecutor = CodeExecutor.getInstance();
  }
} catch (error) {
  console.warn(
    "CodeExecutor modules not available in this environment:",
    error
  );
}

// Exportar la instancia principal
export { codeExecutor };

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

// Exportar tipos (siempre disponibles)
export * from "./codeExecutor/types";

// Configuración de runtime para diferentes entornos
export interface RuntimeConfig {
  supportsIsolatedVM: boolean;
  supportsEdgeRuntime: boolean;
  supportsNodeRuntime: boolean;
  recommendedRuntime: "edge" | "nodejs";
}

// Detectar capacidades del entorno
export function detectRuntimeCapabilities(): RuntimeConfig {
  const isNode =
    typeof process !== "undefined" && process.versions && process.versions.node;
  const isEdge = typeof EdgeRuntime !== "undefined";

  // Verificar si isolated-vm está disponible
  let supportsIsolatedVM = false;
  try {
    require("isolated-vm");
    supportsIsolatedVM = true;
  } catch (error) {
    supportsIsolatedVM = false;
  }

  return {
    supportsIsolatedVM,
    supportsEdgeRuntime: isEdge,
    supportsNodeRuntime: isNode,
    recommendedRuntime: supportsIsolatedVM ? "nodejs" : "edge",
  };
}

// Obtener configuración recomendada
export function getRecommendedRuntime(): "edge" | "nodejs" {
  const config = detectRuntimeCapabilities();
  return config.recommendedRuntime;
}

// Verificar si el CodeExecutor está disponible
export function isCodeExecutorAvailable(): boolean {
  try {
    const { codeExecutor } = require("@/lib");
    return codeExecutor !== null;
  } catch (error) {
    return false;
  }
}

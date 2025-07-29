// Configuración de rendimiento para evitar re-renderizados innecesarios

export const PERFORMANCE_CONFIG = {
  // Configuración de debounce para inputs
  DEBOUNCE_DELAY: 300,

  // Configuración de throttle para scroll
  THROTTLE_DELAY: 100,

  // Configuración de memoización
  MEMO_DEPENDENCIES: {
    // Profundidad máxima para comparación de objetos
    MAX_DEPTH: 3,
    // Tamaño máximo de arrays para comparación
    MAX_ARRAY_SIZE: 100,
  },

  // Configuración de caché
  CACHE: {
    // Tiempo de vida del caché en milisegundos
    TTL: 5 * 60 * 1000, // 5 minutos
    // Tamaño máximo del caché
    MAX_SIZE: 100,
  },

  // Configuración de re-renderizado
  RERENDER: {
    // Intervalo mínimo entre re-renderizados en milisegundos
    MIN_INTERVAL: 16, // ~60fps
    // Número máximo de re-renderizados por segundo
    MAX_PER_SECOND: 60,
  },

  // Configuración de lazy loading
  LAZY_LOADING: {
    // Umbral de intersección para lazy loading
    THRESHOLD: 0.1,
    // Margen de raíz para lazy loading
    ROOT_MARGIN: "50px",
  },
};

// Función para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Función para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Función para comparación profunda optimizada
export const deepEqual = (
  a: any,
  b: any,
  maxDepth = PERFORMANCE_CONFIG.MEMO_DEPENDENCIES.MAX_DEPTH
): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (maxDepth <= 0) return true; // Evitar recursión infinita

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    if (a.length > PERFORMANCE_CONFIG.MEMO_DEPENDENCIES.MAX_ARRAY_SIZE)
      return true; // Skip large arrays
    return a.every((item, index) => deepEqual(item, b[index], maxDepth - 1));
  }

  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(a[key], b[key], maxDepth - 1));
  }

  return false;
};

// Hook personalizado para memoización optimizada
export const useMemoOptimized = <T>(
  factory: () => T,
  deps: any[],
  maxDepth = PERFORMANCE_CONFIG.MEMO_DEPENDENCIES.MAX_DEPTH
): T => {
  const [memoizedValue, setMemoizedValue] = React.useState<T>(factory);
  const prevDeps = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (!deepEqual(deps, prevDeps.current, maxDepth)) {
      setMemoizedValue(factory());
      prevDeps.current = deps;
    }
  }, deps);

  return memoizedValue;
};

// Función para detectar re-renderizados innecesarios
export const detectUnnecessaryRenders = (componentName: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 [PERFORMANCE] ${componentName} re-renderizado`);
  }
};

// Función para medir el tiempo de renderizado
export const measureRenderTime = (componentName: string) => {
  if (process.env.NODE_ENV === "development") {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(
        `⏱️ [PERFORMANCE] ${componentName} renderizado en ${(
          end - start
        ).toFixed(2)}ms`
      );
    };
  }
  return () => {};
};

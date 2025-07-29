# 🚀 CodeExecutor - Ejemplos de Uso Completo

## 📋 Configuración Inicial

### 1. Instalación de Dependencias
```bash
npm install isolated-vm lru-cache redlock prom-client
```

### 2. Configuración del Entorno
```bash
# Variables de entorno necesarias
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

### 3. Inicialización del Sistema
```typescript
import { codeExecutor } from './lib';

// Inicializar el sistema completo
async function initializeCodeExecutor() {
  try {
    await codeExecutor.initialize();
    
    // Configurar opciones avanzadas
    codeExecutor.configure({
      defaultResourceLimits: {
        maxExecutionTime: 30000, // 30 segundos
        maxMemoryUsage: 512, // 512 MB
        allowNetworkAccess: false,
        allowFileSystemAccess: false,
        maxCpuUsage: 50, // 50% CPU
      },
      enableLogging: true,
      enableMetrics: true,
      enableSecurityChecks: true,
      enablePerformanceMonitoring: true,
      maxConcurrentExecutions: 100,
      cleanupInterval: 3600000, // 1 hora
      retentionPeriod: 2592000000, // 30 días
      logLevel: 'info',
    });

    console.log('✅ CodeExecutor inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando CodeExecutor:', error);
  }
}

initializeCodeExecutor();
```

## 🔧 Ejemplos de Uso Básico

### Ejemplo 1: Ejecución Simple de JavaScript
```typescript
import { codeExecutor } from './lib';

async function ejecutarJavaScriptBasico() {
  const codigo = `
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const resultado = factorial(5);
console.log('Factorial de 5:', resultado);
  `;

  try {
    const resultado = await codeExecutor.executeCode(
      'usuario123',
      'javascript',
      codigo,
      undefined,
      {
        enableAnalysis: true,
        enableSecurityCheck: true,
        resourceLimits: {
          maxExecutionTime: 5000,
          maxMemoryUsage: 128,
        }
      }
    );

    console.log('✅ Ejecución exitosa');
    console.log('Output:', resultado.execution.output);
    console.log('Tiempo de ejecución:', resultado.execution.executionTime, 'ms');
    console.log('Uso de memoria:', resultado.execution.memoryUsage, 'MB');
    
    if (resultado.analysis) {
      console.log('Complejidad del código:', resultado.analysis.complexity);
      console.log('Sugerencias:', resultado.analysis.suggestions);
    }

  } catch (error) {
    console.error('❌ Error en la ejecución:', error);
  }
}
```

### Ejemplo 2: Ejecución de Python con Tests
```typescript
import { codeExecutor } from './lib';

async function ejecutarPythonConTests() {
  const codigo = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calcular los primeros 10 números de Fibonacci
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
  `;

  try {
    const resultado = await codeExecutor.executeCode(
      'usuario456',
      'python',
      codigo,
      undefined,
      {
        enableAnalysis: true,
        enableTests: true,
        enableSecurityCheck: true,
        enablePerformanceMonitoring: true,
        resourceLimits: {
          maxExecutionTime: 10000,
          maxMemoryUsage: 256,
        }
      }
    );

    console.log('✅ Ejecución de Python completada');
    console.log('Output:', resultado.execution.output);
    
    if (resultado.tests) {
      console.log('Tests generados:', resultado.tests.testCases.length);
      console.log('Cobertura de tests:', resultado.tests.coverage);
      console.log('Confianza en tests:', resultado.tests.confidence);
    }

    if (resultado.analysis) {
      console.log('Análisis de rendimiento:', resultado.analysis.performanceScore);
      console.log('Mejores prácticas:', resultado.analysis.bestPractices);
    }

  } catch (error) {
    console.error('❌ Error en la ejecución de Python:', error);
  }
}
```

## 🔒 Ejemplos de Seguridad

### Ejemplo 3: Análisis de Seguridad
```typescript
import { securityManager } from './lib';

async function analizarSeguridad() {
  const codigoPeligroso = `
// Código potencialmente peligroso
eval('console.log("Hello World")');
process.exit(1);
require('fs').readFileSync('/etc/passwd');
  `;

  try {
    const reporteSeguridad = await securityManager.analyzeSecurity(
      codigoPeligroso,
      'javascript',
      { userId: 'usuario789', sessionId: 'session123' }
    );

    console.log('🔒 Reporte de Seguridad:');
    console.log('Nivel de amenaza:', reporteSeguridad.threatLevel);
    console.log('Puntuación de seguridad:', reporteSeguridad.securityScore);
    console.log('Es seguro:', reporteSeguridad.isSafe);
    console.log('Vulnerabilidades encontradas:', reporteSeguridad.vulnerabilities.length);

    if (reporteSeguridad.vulnerabilities.length > 0) {
      console.log('Detalles de vulnerabilidades:');
      reporteSeguridad.vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. ${vuln.type}: ${vuln.description}`);
        console.log(`   Severidad: ${vuln.severity}`);
        console.log(`   Sugerencia: ${vuln.suggestion}`);
      });
    }

    // Código sanitizado
    const codigoSanitizado = securityManager.sanitizeCode(codigoPeligroso, 'javascript');
    console.log('Código sanitizado:', codigoSanitizado);

  } catch (error) {
    console.error('❌ Error en análisis de seguridad:', error);
  }
}
```

## 🧪 Ejemplos de Generación de Tests

### Ejemplo 4: Generación y Ejecución de Tests
```typescript
import { testGenerator } from './lib';

async function generarYEjecutarTests() {
  const codigo = `
function suma(a, b) {
  return a + b;
}

function multiplica(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('División por cero');
  }
  return a / b;
}
  `;

  try {
    // Generar tests
    const tests = await testGenerator.generateTests(
      codigo,
      'javascript',
      {
        functionName: 'suma',
        description: 'Funciones matemáticas básicas',
        testTypes: ['unit', 'edge', 'performance'],
        maxTests: 8,
        context: { userId: 'usuario123' }
      }
    );

    console.log('🧪 Tests generados:', tests.testCases.length);
    console.log('Cobertura estimada:', tests.coverage);
    console.log('Confianza:', tests.confidence);

    // Ejecutar tests
    const resultados = await testGenerator.runTests(tests, codigo, 'javascript');
    
    console.log('📊 Resultados de Tests:');
    console.log('Total tests:', resultados.summary.total);
    console.log('Tests exitosos:', resultados.summary.passed);
    console.log('Tests fallidos:', resultados.summary.failed);
    console.log('Tasa de éxito:', resultados.summary.successRate);
    console.log('Tiempo promedio:', resultados.summary.averageExecutionTime, 'ms');

    // Optimizar tests si es necesario
    if (resultados.summary.successRate < 0.8) {
      console.log('🔄 Optimizando tests...');
      const testsOptimizados = await testGenerator.optimizeTests(tests, resultados.results);
      console.log('Tests optimizados generados:', testsOptimizados.testCases.length);
    }

  } catch (error) {
    console.error('❌ Error en generación de tests:', error);
  }
}
```

## 🧠 Ejemplos de Memoria Semántica

### Ejemplo 5: Búsqueda de Patrones Similares
```typescript
import { codeMemory } from './lib';

async function buscarPatronesSimilares() {
  const codigoConsulta = `
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
  `;

  try {
    // Buscar patrones similares
    const patronesSimilares = await codeMemory.findSimilarPatterns(
      codigoConsulta,
      'javascript',
      {
        userId: 'usuario123',
        limit: 5,
        threshold: 0.7,
        context: { userId: 'usuario123' }
      }
    );

    console.log('🔍 Patrones similares encontrados:', patronesSimilares.length);
    
    patronesSimilares.forEach((resultado, index) => {
      console.log(`\n${index + 1}. Patrón similar:`);
      console.log('Similitud:', resultado.similarity);
      console.log('Relevancia:', resultado.relevance);
      console.log('Tasa de éxito:', resultado.pattern.successRate);
      console.log('Uso:', resultado.pattern.usageCount, 'veces');
      console.log('Lenguaje:', resultado.pattern.language);
      console.log('Tags:', resultado.pattern.tags.join(', '));
    });

    // Obtener sugerencias de mejora
    const sugerencias = await codeMemory.getPatternSuggestions(
      codigoConsulta,
      'javascript',
      { userId: 'usuario123' }
    );

    console.log('\n💡 Sugerencias de mejora:');
    console.log('Mejoras:', sugerencias.improvements);
    console.log('Optimizaciones:', sugerencias.optimizations);
    console.log('Mejores prácticas:', sugerencias.bestPractices);
    console.log('Notas de seguridad:', sugerencias.securitySuggestions);

  } catch (error) {
    console.error('❌ Error en búsqueda de patrones:', error);
  }
}
```

## 📊 Ejemplos de Monitoreo y Logging

### Ejemplo 6: Logging y Auditoría
```typescript
import { executionLogger } from './lib';

async function ejemploLogging() {
  const userId = 'usuario123';
  const sessionId = 'session456';

  try {
    // Obtener logs del usuario
    const logs = await executionLogger.getUserLogs(userId, {
      level: 'info',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      limit: 20
    });

    console.log('📝 Logs del usuario:', logs.length);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.timestamp.toISOString()}] ${log.level}: ${log.message}`);
      if (log.data) {
        console.log('   Datos:', log.data);
      }
    });

    // Obtener auditoría
    const auditoria = await executionLogger.getAuditTrail(userId, {
      action: 'code_execution',
      limit: 10
    });

    console.log('\n🔍 Auditoría de ejecuciones:', auditoria.length);
    auditoria.forEach((trail, index) => {
      console.log(`${index + 1}. [${trail.timestamp.toISOString()}] ${trail.action}: ${trail.resource}`);
      console.log('   Éxito:', trail.success);
      console.log('   IP:', trail.ip);
    });

    // Exportar logs
    const logsExportados = await executionLogger.exportLogs(userId, 'json', {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
      includeAuditTrail: true
    });

    console.log('\n💾 Logs exportados (tamaño):', logsExportados.length, 'caracteres');

    // Obtener estadísticas
    const stats = await executionLogger.getLogStats(userId);
    console.log('\n📊 Estadísticas de logs:');
    console.log('Total logs:', stats.totalLogs);
    console.log('Logs por nivel:', stats.logsByLevel);
    console.log('Promedio por día:', stats.averageLogsPerDay);
    console.log('Hora más activa:', stats.mostActiveHour);
    console.log('Tasa de errores:', stats.errorRate);

  } catch (error) {
    console.error('❌ Error en logging:', error);
  }
}
```

## 🔍 Ejemplos de Análisis Avanzado

### Ejemplo 7: Análisis Completo de Código
```typescript
import { executionAnalyzer } from './lib';

async function analizarCodigoCompleto() {
  const codigo = `
class CalculadoraAvanzada {
  constructor() {
    this.historial = [];
  }

  suma(a, b) {
    const resultado = a + b;
    this.historial.push({ operacion: 'suma', a, b, resultado });
    return resultado;
  }

  resta(a, b) {
    const resultado = a - b;
    this.historial.push({ operacion: 'resta', a, b, resultado });
    return resultado;
  }

  multiplica(a, b) {
    const resultado = a * b;
    this.historial.push({ operacion: 'multiplica', a, b, resultado });
    return resultado;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('División por cero no permitida');
    }
    const resultado = a / b;
    this.historial.push({ operacion: 'divide', a, b, resultado });
    return resultado;
  }

  obtenerHistorial() {
    return this.historial;
  }

  limpiarHistorial() {
    this.historial = [];
  }
}
  `;

  try {
    // Análisis de código
    const analisis = await executionAnalyzer.analyzeCode(
      codigo,
      'javascript',
      { userId: 'usuario123' }
    );

    console.log('🔍 Análisis de Código:');
    console.log('Complejidad:', analisis.complexity, '/10');
    console.log('Complejidad ciclomática:', analisis.cyclomaticComplexity);
    console.log('Puntuación de seguridad:', analisis.securityScore);
    console.log('Puntuación de rendimiento:', analisis.performanceScore);
    console.log('Puntuación de mantenibilidad:', analisis.maintainabilityScore);
    console.log('Puntuación de estilo:', analisis.codeStyleScore);

    console.log('\n⚠️ Problemas potenciales:');
    analisis.potentialIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    console.log('\n💡 Sugerencias:');
    analisis.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });

    console.log('\n🛠️ Sugerencias de refactoring:');
    analisis.refactoringSuggestions?.forEach((refactor, index) => {
      console.log(`${index + 1}. ${refactor}`);
    });

    console.log('\n📋 Mejores prácticas:');
    analisis.bestPractices?.forEach((practice, index) => {
      console.log(`${index + 1}. ${practice}`);
    });

  } catch (error) {
    console.error('❌ Error en análisis de código:', error);
  }
}
```

## 🚀 Ejemplo Completo de Integración

### Ejemplo 8: Sistema Completo en Acción
```typescript
import { codeExecutor, executionLogger, codeMemory } from './lib';

async function sistemaCompleto() {
  const userId = 'usuario_final';
  const sessionId = 'session_completa';

  console.log('🚀 Iniciando sistema completo de CodeExecutor...');

  try {
    // 1. Ejecutar código con todas las características
    const resultado = await codeExecutor.executeCode(
      userId,
      'javascript',
      `
// Algoritmo de ordenamiento rápido
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Ejemplo de uso
const numeros = [64, 34, 25, 12, 22, 11, 90];
const ordenados = quickSort(numeros);
console.log('Números originales:', numeros);
console.log('Números ordenados:', ordenados);
      `,
      undefined,
      {
        enableAnalysis: true,
        enableTests: true,
        enableSecurityCheck: true,
        enablePerformanceMonitoring: true,
        resourceLimits: {
          maxExecutionTime: 15000,
          maxMemoryUsage: 256,
        },
        context: {
          userId,
          sessionId,
          environment: 'production',
          priority: 'normal'
        }
      }
    );

    console.log('\n✅ Ejecución completada exitosamente');
    console.log('Output:', resultado.execution.output);
    console.log('Tiempo de ejecución:', resultado.execution.executionTime, 'ms');
    console.log('Uso de memoria:', resultado.execution.memoryUsage, 'MB');

    // 2. Mostrar análisis
    if (resultado.analysis) {
      console.log('\n📊 Análisis de Código:');
      console.log('Complejidad:', resultado.analysis.complexity, '/10');
      console.log('Puntuación de seguridad:', resultado.analysis.securityScore);
      console.log('Puntuación de rendimiento:', resultado.analysis.performanceScore);
      console.log('Sugerencias:', resultado.analysis.suggestions.length);
    }

    // 3. Mostrar tests generados
    if (resultado.tests) {
      console.log('\n🧪 Tests Generados:');
      console.log('Cantidad de tests:', resultado.tests.testCases.length);
      console.log('Cobertura:', resultado.tests.coverage);
      console.log('Confianza:', resultado.tests.confidence);
      
      resultado.tests.testCases.forEach((test, index) => {
        console.log(`Test ${index + 1}: ${test.description}`);
        console.log(`  Input: ${test.input}`);
        console.log(`  Expected: ${test.expectedOutput}`);
      });
    }

    // 4. Mostrar reporte de seguridad
    if (resultado.securityReport) {
      console.log('\n🔒 Reporte de Seguridad:');
      console.log('Nivel de amenaza:', resultado.securityReport.threatLevel);
      console.log('Puntuación de seguridad:', resultado.securityReport.securityScore);
      console.log('Es seguro:', resultado.securityReport.isSafe);
    }

    // 5. Buscar patrones similares
    const patronesSimilares = await codeMemory.findSimilarPatterns(
      resultado.execution.code,
      resultado.execution.language,
      { userId, limit: 3 }
    );

    console.log('\n🔍 Patrones Similares Encontrados:', patronesSimilares.length);
    patronesSimilares.forEach((patron, index) => {
      console.log(`Patrón ${index + 1}: Similitud ${patron.similarity}, Éxito ${patron.pattern.successRate}`);
    });

    // 6. Obtener estadísticas del sistema
    const stats = await codeExecutor.getExecutionStats();
    console.log('\n📈 Estadísticas del Sistema:');
    console.log('Total ejecuciones:', stats.totalExecutions);
    console.log('Ejecuciones exitosas:', stats.successfulExecutions);
    console.log('Tasa de éxito:', (stats.successfulExecutions / stats.totalExecutions * 100).toFixed(2) + '%');
    console.log('Lenguaje más usado:', stats.mostUsedLanguage);
    console.log('Tiempo promedio:', stats.averageExecutionTime, 'ms');

    // 7. Health check del sistema
    const health = await codeExecutor.healthCheck();
    console.log('\n🏥 Estado del Sistema:', health.status);
    console.log('Detalles:', health.details);

    console.log('\n🎉 Sistema completo funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error en el sistema completo:', error);
    
    // Logging del error
    await executionLogger.logError(error as Error, {
      userId,
      sessionId,
      code: 'código de ejemplo',
      language: 'javascript'
    });
  }
}

// Ejecutar el sistema completo
sistemaCompleto();
```

## 📋 Resumen de Características Demostradas

### ✅ Funcionalidades Implementadas
- **🔒 Seguridad**: Análisis estático y con IA, sanitización de código
- **🧠 IA Integrada**: Análisis de código, generación de tests, debugging automático
- **📊 Monitoreo**: Logging estructurado, métricas, auditoría completa
- **⚡ Rendimiento**: Cache distribuido, optimización automática
- **🔄 Escalabilidad**: Arquitectura modular, concurrencia controlada
- **🧪 Testing**: Generación automática, ejecución, optimización
- **🔍 Análisis**: Complejidad, rendimiento, mejores prácticas
- **💾 Memoria**: Patrones semánticos, búsqueda inteligente

### 🎯 Beneficios Obtenidos
- **Seguridad de nivel empresarial** con sandboxing avanzado
- **Inteligencia artificial** para análisis y optimización automática
- **Monitoreo profesional** con métricas y alertas en tiempo real
- **Rendimiento optimizado** con cache distribuido y búsqueda semántica
- **Escalabilidad horizontal** con arquitectura modular
- **Mantenibilidad superior** con separación clara de responsabilidades

El sistema `CodeExecutor` está ahora al nivel de ChatGPT Plus y listo para entornos de producción de alta demanda. 🚀
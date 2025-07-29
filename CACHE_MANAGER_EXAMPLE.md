# 🚀 Ejemplo de Uso del CacheManager Mejorado - Nivel ChatGPT Plus

## 📋 Funcionalidades Implementadas

El `CacheManager` ha sido completamente modernizado para alcanzar el nivel profesional de ChatGPT Plus con las siguientes mejoras críticas:

### ✅ **Mejoras Implementadas**

1. **Redis con Backoff Exponencial** ✅
2. **Caché Local LRU Avanzada** ✅
3. **Control de Concurrencia con Redlock** ✅
4. **Serialización Segura** ✅
5. **Métricas Prometheus** ✅
6. **Logging Estructurado** ✅
7. **Health Checks** ✅
8. **Configuración Dinámica** ✅

## 🚀 Ejemplos de Uso

### 1. **Uso Básico del Caché**

```typescript
import { cacheManager } from './lib/cacheManager';

// Ejemplo básico de uso
async function ejemploBasico() {
  const userId = "user123";
  const userData = {
    name: "Juan Pérez",
    email: "juan@example.com",
    preferences: { theme: "dark", language: "es" }
  };

  // Guardar datos en caché
  await cacheManager.set(`user:${userId}`, userData, {
    ttl: 3600, // 1 hora
    prefix: "users"
  });

  // Obtener datos del caché
  const cachedUser = await cacheManager.get(`user:${userId}`, {
    prefix: "users"
  });

  console.log("Usuario desde caché:", cachedUser);
}
```

### 2. **Operaciones con Control de Concurrencia**

```typescript
// Ejemplo de operación segura con Redlock
async function ejemploOperacionSegura() {
  const productId = "prod123";
  const inventory = {
    stock: 100,
    lastUpdated: new Date()
  };

  // Operación segura con control de concurrencia
  await cacheManager.setSafe(`inventory:${productId}`, inventory, {
    ttl: 1800, // 30 minutos
    prefix: "inventory",
    lockTimeout: 5000 // 5 segundos para adquirir lock
  });

  console.log("Inventario guardado de forma segura");
}
```

### 3. **Incrementos Atómicos**

```typescript
// Ejemplo de contadores atómicos
async function ejemploContadores() {
  const sessionId = "session456";
  
  // Incrementar contador de visitas
  const visitCount = await cacheManager.increment(`visits:${sessionId}`, 1, {
    ttl: 86400, // 24 horas
    prefix: "analytics"
  });

  console.log(`Visita número ${visitCount} registrada`);

  // Incrementar múltiples contadores
  await Promise.all([
    cacheManager.increment("total_visits", 1, { prefix: "global" }),
    cacheManager.increment("daily_visits", 1, { prefix: "daily" }),
    cacheManager.increment("hourly_visits", 1, { prefix: "hourly" })
  ]);
}
```

### 4. **Gestión de Expiración**

```typescript
// Ejemplo de gestión de TTL
async function ejemploExpiración() {
  const token = "jwt_token_123";
  const tokenData = { userId: "user123", permissions: ["read", "write"] };

  // Guardar token con TTL corto
  await cacheManager.set(`token:${token}`, tokenData, {
    ttl: 300 // 5 minutos
  });

  // Extender TTL si es necesario
  await cacheManager.expire(`token:${token}`, 600); // Extender a 10 minutos

  console.log("Token guardado y TTL extendido");
}
```

### 5. **Monitoreo y Métricas**

```typescript
// Ejemplo de obtención de métricas
async function ejemploMetricas() {
  // Obtener estadísticas completas
  const stats = cacheManager.getStats();
  
  console.log("📊 Estadísticas del Caché:");
  console.log(`- Redis conectado: ${stats.redisConnected ? '✅' : '❌'}`);
  console.log(`- Tamaño caché local: ${stats.localCacheSize}/${stats.localCacheMaxSize}`);
  console.log(`- Cache hits: ${stats.cacheHits}`);
  console.log(`- Cache misses: ${stats.cacheMisses}`);
  console.log(`- Hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`- Tiempo promedio: ${stats.averageResponseTime.toFixed(0)}ms`);
  console.log(`- Operaciones totales: ${stats.totalOperations}`);
  console.log(`- Operaciones fallidas: ${stats.failedOperations}`);
  console.log(`- Locks adquiridos: ${stats.lockAcquisitions}`);
  console.log(`- Fallos de lock: ${stats.lockFailures}`);

  // Obtener métricas para monitoreo
  const metrics = cacheManager.getMetrics();
  console.log("📈 Métricas de Monitoreo:", metrics);

  // Verificar salud del sistema
  const health = await cacheManager.healthCheck();
  console.log("🏥 Estado de Salud:", health);
}
```

### 6. **Configuración Dinámica**

```typescript
// Ejemplo de configuración dinámica
async function ejemploConfiguracion() {
  // Configurar TTL por defecto
  cacheManager.setDefaultTTL(7200); // 2 horas

  // Configurar número de reintentos
  cacheManager.setRetryAttempts(5);

  // Configurar timeout de locks
  cacheManager.setLockTimeout(3000); // 3 segundos

  console.log("Configuración actualizada");
}
```

### 7. **Uso Avanzado con Múltiples Prefijos**

```typescript
// Ejemplo de uso con múltiples prefijos para organización
async function ejemploPrefijos() {
  const userId = "user789";

  // Datos de usuario
  await cacheManager.set(`profile:${userId}`, {
    name: "María García",
    email: "maria@example.com"
  }, { prefix: "user_profiles", ttl: 3600 });

  // Preferencias de usuario
  await cacheManager.set(`preferences:${userId}`, {
    theme: "light",
    language: "en",
    notifications: true
  }, { prefix: "user_preferences", ttl: 7200 });

  // Historial de sesiones
  await cacheManager.set(`sessions:${userId}`, [
    { id: "session1", timestamp: new Date() },
    { id: "session2", timestamp: new Date() }
  ], { prefix: "user_sessions", ttl: 1800 });

  // Obtener todos los datos del usuario
  const [profile, preferences, sessions] = await Promise.all([
    cacheManager.get(`profile:${userId}`, { prefix: "user_profiles" }),
    cacheManager.get(`preferences:${userId}`, { prefix: "user_preferences" }),
    cacheManager.get(`sessions:${userId}`, { prefix: "user_sessions" })
  ]);

  console.log("Datos completos del usuario:", { profile, preferences, sessions });
}
```

### 8. **Manejo de Errores y Fallbacks**

```typescript
// Ejemplo de manejo robusto de errores
async function ejemploManejoErrores() {
  try {
    // Intentar operación que podría fallar
    const result = await cacheManager.get("datos_criticos", {
      prefix: "critical_data"
    });

    if (!result) {
      // Fallback: obtener datos de base de datos
      const dbData = await fetchFromDatabase("datos_criticos");
      
      // Guardar en caché para futuras consultas
      await cacheManager.set("datos_criticos", dbData, {
        prefix: "critical_data",
        ttl: 1800
      });

      return dbData;
    }

    return result;

  } catch (error) {
    console.error("Error en operación de caché:", error);
    
    // El sistema automáticamente usa caché local como fallback
    // No es necesario manejo adicional
    throw error;
  }
}
```

### 9. **Limpieza y Mantenimiento**

```typescript
// Ejemplo de limpieza y mantenimiento
async function ejemploLimpieza() {
  // Limpiar caché local
  cacheManager.clear();

  // Eliminar elementos específicos
  await cacheManager.delete("user:123", { prefix: "users" });
  await cacheManager.delete("session:456", { prefix: "sessions" });

  // Verificar estado después de limpieza
  const stats = cacheManager.getStats();
  console.log("Estado después de limpieza:", stats);
}
```

### 10. **Uso Completo del Sistema**

```typescript
// Ejemplo completo de uso del sistema
async function ejemploCompleto() {
  console.log("🚀 Iniciando ejemplo completo del CacheManager");

  // 1. Configurar el sistema
  cacheManager.setDefaultTTL(3600);
  cacheManager.setRetryAttempts(3);
  cacheManager.setLockTimeout(2000);

  // 2. Simular carga de trabajo
  const operations = [];
  
  for (let i = 0; i < 100; i++) {
    operations.push(
      cacheManager.set(`key_${i}`, { value: i, timestamp: new Date() }, {
        prefix: "test_data",
        ttl: 300
      })
    );
  }

  await Promise.all(operations);

  // 3. Leer datos
  const reads = [];
  for (let i = 0; i < 50; i++) {
    reads.push(
      cacheManager.get(`key_${i}`, { prefix: "test_data" })
    );
  }

  const results = await Promise.all(reads);
  console.log(`Leídos ${results.filter(r => r !== null).length} elementos`);

  // 4. Operaciones con locks
  await cacheManager.setSafe("shared_resource", { data: "importante" }, {
    prefix: "shared",
    lockTimeout: 5000
  });

  // 5. Obtener métricas finales
  const finalStats = cacheManager.getStats();
  const health = await cacheManager.healthCheck();

  console.log("📊 Métricas Finales:", finalStats);
  console.log("🏥 Estado Final:", health);

  console.log("✅ Ejemplo completo finalizado");
}
```

## 🛠️ Configuración del Entorno

### Variables de Entorno Requeridas:
```bash
# Redis
REDIS_URL=redis://localhost:6379

# Configuración opcional
CACHE_DEFAULT_TTL=3600
CACHE_MAX_RETRIES=3
CACHE_LOCK_TIMEOUT=2000
```

### Inicialización:
```typescript
import { cacheManager } from './lib/cacheManager';

// El sistema se inicializa automáticamente como singleton
// No es necesario inicialización manual

// Verificar estado inicial
const health = await cacheManager.healthCheck();
console.log("Estado inicial:", health);
```

## 📊 Métricas de Rendimiento Esperadas

### Benchmarks:
- **Latencia de Redis**: <5ms
- **Latencia de caché local**: <1ms
- **Cache hit rate**: >80%
- **Throughput**: 10,000+ operaciones/segundo
- **Tiempo de adquisición de lock**: <10ms

### Optimizaciones Implementadas:
- **Caché LRU**: Evita memory leaks
- **Backoff exponencial**: Reconexión robusta
- **Serialización segura**: Manejo de datos corruptos
- **Métricas en tiempo real**: Monitoreo continuo
- **Fallback automático**: Alta disponibilidad

## 🎯 Beneficios del Sistema Mejorado

### Antes vs Después:

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Escalabilidad** | ❌ Limitada | ✅ Distribuida |
| **Concurrencia** | ❌ Race conditions | ✅ Redlock |
| **Memoria** | ❌ Memory leaks | ✅ LRU automático |
| **Monitoreo** | ❌ Básico | ✅ Métricas completas |
| **Recuperación** | ❌ Manual | ✅ Automática |
| **Rendimiento** | ❌ Variable | ✅ Optimizado |

El `CacheManager` ahora está al nivel profesional de ChatGPT Plus y listo para producción en entornos de alta escala. 🚀
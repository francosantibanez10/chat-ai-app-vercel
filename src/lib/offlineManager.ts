interface OfflineConfig {
  enabled: boolean;
  maxCacheSize: number; // MB
  syncInterval: number; // ms
  retryAttempts: number;
  cacheExpiry: number; // ms
}

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
  type: "conversation" | "message" | "user" | "file" | "settings";
  syncStatus: "pending" | "synced" | "failed";
  retryCount: number;
}

interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  collection: string;
  documentId: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private config: OfflineConfig;
  private cache: Map<string, CacheItem> = new Map();
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<OfflineConfig>) {
    this.config = {
      enabled: true,
      maxCacheSize: 50, // 50MB
      syncInterval: 30000, // 30 segundos
      retryAttempts: 3,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 horas
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    // Escuchar cambios de conectividad
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    // Cargar cache desde localStorage
    this.loadCacheFromStorage();

    // Iniciar sincronización periódica
    this.startSyncInterval();

    // Limpiar cache expirado
    this.cleanupExpiredCache();
  }

  // Manejar cuando vuelve la conexión
  private handleOnline(): void {
    console.log("🌐 [OFFLINE] Conexión restaurada");
    this.isOnline = true;
    this.syncPendingOperations();
  }

  // Manejar cuando se pierde la conexión
  private handleOffline(): void {
    console.log("📴 [OFFLINE] Conexión perdida - Activando modo offline");
    this.isOnline = false;
  }

  // Guardar datos en cache
  async setCache(
    key: string,
    data: any,
    type: CacheItem["type"]
  ): Promise<void> {
    const item: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.config.cacheExpiry,
      type,
      syncStatus: "synced",
      retryCount: 0,
    };

    this.cache.set(key, item);
    this.saveCacheToStorage();
    this.checkCacheSize();
  }

  // Obtener datos del cache
  async getCache(key: string): Promise<any | null> {
    const item = this.cache.get(key);

    if (!item) return null;

    // Verificar si ha expirado
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.saveCacheToStorage();
      return null;
    }

    return item.data;
  }

  // Guardar operación para sincronización
  async queueSyncOperation(
    operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount">
  ): Promise<void> {
    const syncOp: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncOp);
    this.saveSyncQueueToStorage();

    // Si estamos online, intentar sincronizar inmediatamente
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  // Sincronizar operaciones pendientes
  private async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(
      `🔄 [OFFLINE] Sincronizando ${this.syncQueue.length} operaciones pendientes`
    );

    const operationsToSync = [...this.syncQueue];
    const successfulOps: string[] = [];
    const failedOps: SyncOperation[] = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeSyncOperation(operation);
        successfulOps.push(operation.id);
      } catch (error) {
        console.error(
          `❌ [OFFLINE] Error sincronizando operación ${operation.id}:`,
          error
        );

        if (operation.retryCount < this.config.retryAttempts) {
          operation.retryCount++;
          failedOps.push(operation);
        } else {
          console.error(
            `💀 [OFFLINE] Operación ${operation.id} falló definitivamente después de ${this.config.retryAttempts} intentos`
          );
        }
      }
    }

    // Remover operaciones exitosas y actualizar las fallidas
    this.syncQueue = failedOps;
    this.saveSyncQueueToStorage();

    console.log(
      `✅ [OFFLINE] Sincronización completada: ${successfulOps.length} exitosas, ${failedOps.length} fallidas`
    );
  }

  // Ejecutar operación de sincronización
  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    const { type, collection, documentId, data } = operation;

    switch (type) {
      case "create":
        await this.createDocument(collection, documentId, data);
        break;
      case "update":
        await this.updateDocument(collection, documentId, data);
        break;
      case "delete":
        await this.deleteDocument(collection, documentId);
        break;
      default:
        throw new Error(`Tipo de operación no soportado: ${type}`);
    }
  }

  // Crear documento (simulado - en producción usaría Firebase)
  private async createDocument(
    collection: string,
    documentId: string,
    data: any
  ): Promise<void> {
    // Simular operación de Firebase
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(
      `📝 [OFFLINE] Creando documento ${documentId} en ${collection}`
    );
  }

  // Actualizar documento (simulado - en producción usaría Firebase)
  private async updateDocument(
    collection: string,
    documentId: string,
    data: any
  ): Promise<void> {
    // Simular operación de Firebase
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(
      `✏️ [OFFLINE] Actualizando documento ${documentId} en ${collection}`
    );
  }

  // Eliminar documento (simulado - en producción usaría Firebase)
  private async deleteDocument(
    collection: string,
    documentId: string
  ): Promise<void> {
    // Simular operación de Firebase
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(
      `🗑️ [OFFLINE] Eliminando documento ${documentId} en ${collection}`
    );
  }

  // Iniciar sincronización periódica
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncPendingOperations();
      }
    }, this.config.syncInterval);
  }

  // Verificar tamaño del cache
  private checkCacheSize(): void {
    const cacheSize = this.getCacheSize();
    const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024; // Convertir MB a bytes

    if (cacheSize > maxSizeBytes) {
      this.cleanupOldestCache();
    }
  }

  // Obtener tamaño del cache
  private getCacheSize(): number {
    let size = 0;
    for (const [key, item] of this.cache) {
      size += JSON.stringify(item).length;
    }
    return size;
  }

  // Limpiar cache más antiguo
  private cleanupOldestCache(): void {
    const sortedItems = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Eliminar 20% de los items más antiguos
    const itemsToRemove = Math.ceil(sortedItems.length * 0.2);

    for (let i = 0; i < itemsToRemove; i++) {
      this.cache.delete(sortedItems[i][0]);
    }

    this.saveCacheToStorage();
    console.log(`🧹 [OFFLINE] Limpiados ${itemsToRemove} items del cache`);
  }

  // Limpiar cache expirado
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveCacheToStorage();
      console.log(
        `🧹 [OFFLINE] Limpiados ${removedCount} items expirados del cache`
      );
    }
  }

  // Guardar cache en localStorage
  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem("offline_cache", JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving cache to storage:", error);
    }
  }

  // Cargar cache desde localStorage
  private loadCacheFromStorage(): void {
    try {
      const cacheData = localStorage.getItem("offline_cache");
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
        console.log(`📦 [OFFLINE] Cache cargado: ${this.cache.size} items`);
      }
    } catch (error) {
      console.error("Error loading cache from storage:", error);
    }
  }

  // Guardar cola de sincronización en localStorage
  private saveSyncQueueToStorage(): void {
    try {
      localStorage.setItem(
        "offline_sync_queue",
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error("Error saving sync queue to storage:", error);
    }
  }

  // Cargar cola de sincronización desde localStorage
  private loadSyncQueueFromStorage(): void {
    try {
      const queueData = localStorage.getItem("offline_sync_queue");
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        console.log(
          `📋 [OFFLINE] Cola de sincronización cargada: ${this.syncQueue.length} operaciones`
        );
      }
    } catch (error) {
      console.error("Error loading sync queue from storage:", error);
    }
  }

  // Verificar si estamos offline
  isOffline(): boolean {
    return !this.isOnline;
  }

  // Obtener estadísticas del cache
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    pendingSync: number;
    isOnline: boolean;
  } {
    return {
      totalItems: this.cache.size,
      totalSize: this.getCacheSize(),
      pendingSync: this.syncQueue.length,
      isOnline: this.isOnline,
    };
  }

  // Limpiar todo el cache
  clearCache(): void {
    this.cache.clear();
    this.saveCacheToStorage();
    console.log("🧹 [OFFLINE] Cache completamente limpiado");
  }

  // Configurar modo offline
  configure(config: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled) {
      this.startSyncInterval();
    } else if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  // Habilitar/deshabilitar modo offline
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.startSyncInterval();
    } else if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Instancia singleton
export const offlineManager = new OfflineManager();

// Funciones de conveniencia
export const setOfflineCache = (
  key: string,
  data: any,
  type: CacheItem["type"]
) => offlineManager.setCache(key, data, type);

export const getOfflineCache = (key: string) => offlineManager.getCache(key);

export const queueOfflineSync = (
  operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount">
) => offlineManager.queueSyncOperation(operation);

export const isOffline = () => offlineManager.isOffline();

export const getOfflineStats = () => offlineManager.getCacheStats();

export default offlineManager;

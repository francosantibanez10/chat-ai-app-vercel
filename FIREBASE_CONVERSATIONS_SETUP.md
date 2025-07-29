# 🔥 Sistema de Conversaciones con Firebase

## 📋 Resumen

Este documento describe la implementación completa del sistema de conversaciones con Firebase Firestore, incluyendo configuración de seguridad, índices y despliegue.

## 🏗️ Arquitectura

### Estructura de Datos

#### Colección: `conversations`
```typescript
{
  id: string,                    // ID único de la conversación
  title: string,                 // Título de la conversación
  userId: string,                // ID del usuario propietario
  messages: Message[],           // Array de mensajes
  createdAt: Timestamp,          // Fecha de creación
  updatedAt: Timestamp,          // Fecha de última actualización
  model: string                  // Modelo de IA usado
}
```

#### Tipo: `Message`
```typescript
{
  id: string,                    // ID único del mensaje
  role: 'user' | 'assistant' | 'system',
  content: string,               // Contenido del mensaje
  timestamp: Date                // Fecha del mensaje
}
```

## 🔐 Reglas de Seguridad

### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversaciones: solo el propietario puede acceder
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivos de usuarios: solo el propietario
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Archivos de conversaciones: usuarios autenticados
    match /conversations/{conversationId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Índices de Firestore

### Índices Configurados (`firestore.indexes.json`)

1. **Conversaciones por usuario y fecha de actualización**
   - `userId` (ASC) + `updatedAt` (DESC)
   - Para listar conversaciones ordenadas por actividad

2. **Conversaciones por usuario y fecha de creación**
   - `userId` (ASC) + `createdAt` (DESC)
   - Para listar conversaciones ordenadas por creación

3. **Conversaciones por usuario y título**
   - `userId` (ASC) + `title` (ASC)
   - Para búsqueda de conversaciones por título

## 🚀 Despliegue

### Comandos de Despliegue

```bash
# Desplegar todo
npm run deploy-firebase

# Desplegar solo Firestore (reglas + índices)
npm run deploy-firestore

# Desplegar solo Storage
npm run deploy-storage

# Verificar configuración
npm run verify-firebase
```

### Pasos de Despliegue

1. **Configurar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use <project-id>
   ```

2. **Desplegar Reglas de Firestore**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Desplegar Índices**
   ```bash
   firebase deploy --only firestore:indexes
   ```

4. **Desplegar Reglas de Storage**
   ```bash
   firebase deploy --only storage
   ```

## 🔧 Servicios Implementados

### `src/lib/firebase/conversations.ts`

#### Funciones Principales

- **`createConversation(userId, title)`**: Crear nueva conversación
- **`getUserConversations(userId)`**: Obtener conversaciones del usuario
- **`getConversation(conversationId)`**: Obtener conversación específica
- **`addMessageToConversation(conversationId, message)`**: Agregar mensaje
- **`updateConversationTitle(conversationId, title)`**: Actualizar título
- **`deleteConversation(conversationId)`**: Eliminar conversación
- **`updateConversationModel(conversationId, model)`**: Actualizar modelo

### `src/contexts/ConversationsContext.tsx`

#### Estado Global

- **`conversations`**: Lista de conversaciones del usuario
- **`currentConversation`**: Conversación actualmente cargada
- **`isLoading`**: Estado de carga
- **`error`**: Errores del sistema

#### Acciones

- **`createNewConversation()`**: Crear nueva conversación
- **`loadConversation(id)`**: Cargar conversación específica
- **`addMessage(id, message)`**: Agregar mensaje
- **`updateTitle(id, title)`**: Actualizar título
- **`deleteConversationById(id)`**: Eliminar conversación
- **`refreshConversations()`**: Actualizar lista

## 🎯 Funcionalidades del Sidebar

### Lista de Conversaciones
- Muestra todas las conversaciones del usuario
- Ordenadas por fecha de última actualización
- Información: título, fecha, número de mensajes

### Búsqueda
- Filtrado en tiempo real por título
- Búsqueda case-insensitive
- Resultados instantáneos

### Acciones
- **Click**: Abrir conversación
- **Hover**: Mostrar botón eliminar
- **Eliminar**: Confirmación antes de eliminar

## 🔄 Flujo de Trabajo

1. **Usuario inicia sesión** → Se cargan sus conversaciones
2. **Crea nueva conversación** → Se crea en Firebase y redirige
3. **Escribe mensaje** → Se guarda automáticamente en Firebase
4. **AI responde** → Se guarda la respuesta en Firebase
5. **Navega entre conversaciones** → Se cargan desde Firebase
6. **Elimina conversación** → Se elimina de Firebase con confirmación

## 🛡️ Seguridad

### Validaciones Implementadas

- **Autenticación requerida**: Todas las operaciones requieren usuario autenticado
- **Propiedad de datos**: Usuarios solo pueden acceder a sus propias conversaciones
- **Validación de entrada**: Sanitización de datos antes de guardar
- **Manejo de errores**: Gestión centralizada de errores

### Reglas de Seguridad

- **Firestore**: Acceso basado en `userId`
- **Storage**: Acceso basado en autenticación
- **Denegación por defecto**: Todo lo demás está bloqueado

## 📱 Integración con la UI

### Componentes Actualizados

- **`Sidebar`**: Lista de conversaciones con búsqueda
- **`Chat`**: Integración con sistema de conversaciones
- **`ChatInput`**: Guardado automático de mensajes
- **`ChatMessage`**: Acciones por mensaje

### Rutas Dinámicas

- **`/chat`**: Página principal de chat
- **`/chat/[id]`**: Conversación específica
- **Navegación automática**: URLs únicas por conversación

## 🔍 Verificación

### Script de Verificación

```bash
npm run verify-firebase
```

Verifica:
- ✅ Configuración de Firebase
- ✅ Autenticación
- ✅ Firestore
- ✅ Reglas de seguridad
- ✅ Índices desplegados

## 🚨 Troubleshooting

### Errores Comunes

1. **"Module not found: Can't resolve './firebase'"**
   - Verificar ruta de importación en `conversations.ts`

2. **"Permission denied"**
   - Verificar reglas de seguridad desplegadas
   - Verificar autenticación del usuario

3. **"Index not found"**
   - Desplegar índices: `firebase deploy --only firestore:indexes`

4. **"Storage rules compilation error"**
   - Verificar sintaxis en `storage.rules`

### Logs de Debug

```javascript
// Habilitar logs de Firebase
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## 📈 Próximos Pasos

### Mejoras Sugeridas

1. **Paginación**: Para conversaciones largas
2. **Búsqueda en mensajes**: Buscar contenido específico
3. **Archivo de conversaciones**: Marcar como archivadas
4. **Exportación**: Exportar conversaciones
5. **Etiquetas**: Categorizar conversaciones
6. **Compartir**: Compartir conversaciones
7. **Backup**: Backup automático
8. **Analytics**: Métricas de uso

### Optimizaciones

1. **Caché local**: Usar localStorage para conversaciones recientes
2. **Lazy loading**: Cargar mensajes bajo demanda
3. **Compresión**: Comprimir mensajes largos
4. **CDN**: Usar CDN para archivos
5. **Offline**: Sincronización offline

---

## ✅ Estado Actual

- ✅ **Firebase configurado**
- ✅ **Reglas de seguridad desplegadas**
- ✅ **Índices configurados**
- ✅ **Sistema de conversaciones funcional**
- ✅ **UI integrada**
- ✅ **Rutas dinámicas**
- ✅ **Verificación automatizada**

¡El sistema está listo para producción! 🎉 
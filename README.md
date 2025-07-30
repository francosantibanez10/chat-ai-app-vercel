# ChatGPT Clone - Aplicación de Chat con IA

Una aplicación de chat con IA similar a ChatGPT, construida con Next.js, TypeScript, Tailwind CSS y OpenAI.

## Características

- 🎨 **Interfaz idéntica a ChatGPT**: Diseño profesional con tema oscuro
- ⚡ **Streaming optimizado**: Respuestas fluidas con streaming inmediato y chunks optimizados
- 🚀 **Latencia ultra-baja**: Runtime optimizado + validación crítica rápida
- 💻 **Soporte para código**: Resaltado de sintaxis y bloques de código
- 📱 **Responsive**: Funciona en desktop y móvil
- 🔧 **Herramientas integradas**: Botones para herramientas, voz y más
- 📚 **Historial de chats**: Navegación entre conversaciones
- 🎯 **UX profesional**: Microinteracciones y animaciones sutiles
- 🔄 **Background processing**: Tareas pesadas ejecutadas en segundo plano

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **IA**: OpenAI API (GPT-4o)
- **Streaming**: AI SDK de Vercel
- **Iconos**: Lucide React

## Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd chat-ai-app
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   OPENAI_API_KEY=tu_api_key_de_openai_aqui
   ```

4. **Obtén tu API Key de OpenAI**
   - Ve a [OpenAI Platform](https://platform.openai.com/)
   - Crea una cuenta o inicia sesión
   - Ve a "API Keys" y genera una nueva clave
   - Copia la clave y pégala en el archivo `.env.local`

5. **Ejecuta la aplicación**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**
   - Ve a `http://localhost:3000`
   - ¡Disfruta de tu aplicación de chat con IA!

## Uso

### Funcionalidades principales

1. **Nuevo Chat**: Haz clic en "Nuevo chat" en la barra lateral
2. **Enviar mensajes**: Escribe en el campo de texto y presiona Enter
3. **Ver código**: Los bloques de código se muestran con resaltado de sintaxis
4. **Navegar chats**: Usa la barra lateral para cambiar entre conversaciones
5. **Herramientas**: Usa los botones de herramientas, voz y más

### Características del streaming optimizado

- **Streaming nativo compatible**: Usa el formato nativo de Vercel AI SDK
- **Modelo optimizado**: GPT-4o-mini para chunks más pequeños y rápidos
- **Streaming inmediato**: Respuestas aparecen al instante sin latencia inicial
- **Runtime Optimizado**: Edge Runtime o Node.js según compatibilidad
- **Validación crítica**: Solo validaciones esenciales antes del streaming
- **Background processing**: Tareas pesadas ejecutadas en segundo plano
- **Auto-scroll optimizado**: Scroll cada 30ms para balance entre fluidez y rendimiento
- **Headers SSE**: Formato estándar para streaming de eventos
- **Soporte para mensajes largos**: Streaming fluido sin interrupciones
- **Configuración de parámetros**: topP, frequencyPenalty, presencePenalty optimizados

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint para chat
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/
│   ├── Chat.tsx                  # Componente principal del chat
│   ├── ChatInput.tsx             # Input para mensajes
│   ├── ChatMessage.tsx           # Componente de mensaje individual
│   └── Sidebar.tsx               # Barra lateral de navegación
```

## Personalización

### Cambiar el modelo de IA

En `src/app/api/chat/route.ts`, puedes cambiar el modelo:

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o', // Cambia a 'gpt-3.5-turbo' para usar GPT-3.5
  stream: true,
  messages,
});
```

### Modificar el diseño

Los estilos están en Tailwind CSS. Puedes modificar:
- Colores en `src/app/globals.css`
- Componentes en `src/components/`
- Layout en `src/app/layout.tsx`

## Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega la variable de entorno `OPENAI_API_KEY`
3. Despliega automáticamente

### Otros proveedores

La aplicación funciona en cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Solución de problemas

### Error de API Key
- Verifica que tu API Key esté correctamente configurada en `.env.local`
- Asegúrate de que la clave tenga créditos disponibles

### Error de CORS
- La aplicación está configurada para desarrollo local
- Para producción, configura los dominios permitidos en tu API

### Error de isolated-vm
- Si ves errores relacionados con `isolated-vm`, la aplicación automáticamente usará Node.js Runtime
- Para desarrollo local, asegúrate de tener Node.js instalado
- En producción, Vercel automáticamente selecciona el runtime apropiado

### Runtime Compatibility
- **Edge Runtime**: Más rápido, pero sin soporte para `isolated-vm`
- **Node.js Runtime**: Compatible con todas las dependencias, incluyendo `isolated-vm`
- La aplicación detecta automáticamente el runtime óptimo

### Problemas de streaming
- Verifica tu conexión a internet
- Asegúrate de que OpenAI API esté funcionando

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Revisa la documentación de OpenAI
- Consulta la documentación de Next.js

---

¡Disfruta de tu aplicación de chat con IA! 🚀

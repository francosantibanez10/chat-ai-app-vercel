# ChatGPT Clone - Aplicación de Chat con IA

Una aplicación de chat con IA similar a ChatGPT, construida con Next.js, TypeScript, Tailwind CSS y OpenAI.

## Características

- 🎨 **Interfaz idéntica a ChatGPT**: Diseño profesional con tema oscuro
- ⚡ **Streaming en tiempo real**: Respuestas fluidas con streaming de OpenAI
- 💻 **Soporte para código**: Resaltado de sintaxis y bloques de código
- 📱 **Responsive**: Funciona en desktop y móvil
- 🔧 **Herramientas integradas**: Botones para herramientas, voz y más
- 📚 **Historial de chats**: Navegación entre conversaciones
- 🎯 **UX profesional**: Microinteracciones y animaciones sutiles

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

### Características del streaming

- Las respuestas aparecen en tiempo real
- Indicador de carga mientras se genera la respuesta
- Soporte para mensajes largos y complejos

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

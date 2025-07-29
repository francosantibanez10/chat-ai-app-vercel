# 🚀 Guía de Deploy - Chat AI App (Vercel)

## 📋 Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **Cuenta de Vercel** (gratuita)
3. **Vercel CLI** instalado globalmente:
   ```bash
   npm install -g vercel
   ```

## 🔧 Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env.local` con las variables necesarias:
```env
OPENAI_API_KEY=tu_api_key_de_openai
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
# Otras variables de entorno...
```

### 3. Configurar Vercel
```bash
vercel login
```

## 🏗️ Build y Deploy

### Build de Desarrollo
```bash
npm run dev
```

### Build de Producción
```bash
npm run build
```

### Deploy a Vercel

#### Deploy de Desarrollo
```bash
npm run deploy-vercel-dev
```

#### Deploy de Producción
```bash
npm run deploy-vercel
```

### Deploy Automático desde GitHub

1. **Conectar repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar variables de entorno en Vercel:**
   - Ve a Settings > Environment Variables
   - Agrega todas las variables de `.env.local`

3. **Deploy automático:**
   - Cada push a `main` hará deploy automático
   - Cada pull request creará un preview

## 🌐 URLs de Producción

- **Sitio Principal**: https://tu-app.vercel.app
- **API Chat**: https://tu-app.vercel.app/api/chat
- **API Generate Image**: https://tu-app.vercel.app/api/generate-image
- **API Web Search**: https://tu-app.vercel.app/api/web-search

## ✅ Ventajas de Vercel

- **Soporte nativo** para Next.js APIs dinámicas
- **Deploy automático** desde GitHub
- **Mejor rendimiento** para aplicaciones dinámicas
- **Más fácil** de configurar
- **Funciona igual** que en desarrollo

## 🔍 Troubleshooting

### Error de build
```bash
npm run build
```

### Error de deploy
```bash
vercel --debug
```

### Variables de entorno
Verificar que todas las variables estén configuradas en Vercel Dashboard.

## 📝 Notas

- Las APIs dinámicas funcionan perfectamente en Vercel
- No necesitas Firebase Functions para las APIs
- El frontend y backend están en la misma plataforma
- Deploy automático con cada cambio en GitHub 
# 🚀 Guía de Despliegue - Rubi AI App

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta en Firebase y/o Vercel
- Variables de entorno configuradas

## 🔧 Configuración Inicial

### 1. Verificar configuración
```bash
npm run check-firebase
```

### 2. Verificar variables de entorno
Asegúrate de que tu archivo `.env.local` contenga todas las variables necesarias.

## 🏗️ Build de Producción

### Build optimizado
```bash
npm run build:production
```

### Build estándar
```bash
npm run build
```

## 🌐 Despliegue en Vercel (Recomendado)

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Configurar variables de entorno en Vercel
Ve a tu dashboard de Vercel y configura las siguientes variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

### 3. Desplegar
```bash
# Despliegue de desarrollo
npm run deploy-vercel-dev

# Despliegue de producción
npm run deploy-vercel
```

## 🔥 Despliegue en Firebase Hosting

### 1. Instalar Firebase CLI
```bash
npm i -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login
```

### 3. Configurar proyecto
```bash
firebase use --add
```

### 4. Desplegar
```bash
# Solo hosting
npm run deploy:firebase

# Todo (hosting + functions)
npm run deploy:firebase:all
```

## 🐳 Despliegue con Docker

### 1. Crear Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Instalar dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build de la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Build y ejecutar
```bash
docker build -t rubi-ai-app .
docker run -p 3000:3000 rubi-ai-app
```

## 🔍 Verificación Post-Despliegue

### 1. Verificar funcionalidad
- [ ] Página principal carga correctamente
- [ ] Autenticación funciona
- [ ] Chat funciona
- [ ] APIs responden correctamente

### 2. Verificar rendimiento
- [ ] Lighthouse score > 90
- [ ] Tiempo de carga < 3s
- [ ] Core Web Vitals en verde

## 🛠️ Troubleshooting

### Error: Variables de entorno no encontradas
```bash
npm run check-firebase
```

### Error: Build falla
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Error: Firebase no inicializa
Verificar que las variables de entorno estén configuradas correctamente en la plataforma de despliegue.

## 📊 Monitoreo

### Vercel Analytics
- Configurar en dashboard de Vercel
- Monitorear Core Web Vitals

### Firebase Analytics
- Configurar en Firebase Console
- Monitorear eventos de usuario

## 🔄 CI/CD

### GitHub Actions (ejemplo)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs de la plataforma de despliegue
2. Verificar variables de entorno
3. Probar build localmente
4. Contactar soporte técnico 
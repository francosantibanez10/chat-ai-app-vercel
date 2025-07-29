# 🔧 Variables de Entorno para Vercel

## 📋 Variables Requeridas

Configura estas variables en **Vercel Dashboard > Settings > Environment Variables**:

### 🔑 **OpenAI API**
```
OPENAI_API_KEY=tu_api_key_de_openai
```

### 🌐 **URLs de la Aplicación**
```
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

### 🔥 **Firebase (si usas Firebase)**
```
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_PRIVATE_KEY=tu_private_key
FIREBASE_CLIENT_EMAIL=tu_client_email
```

### 💳 **Stripe (si usas Stripe)**
```
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
```

### 🔍 **Web Search API (si usas)**
```
SERPER_API_KEY=tu_serper_api_key
```

## 📝 **Cómo configurar en Vercel:**

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Haz clic en **Settings**
3. Ve a **Environment Variables**
4. Agrega cada variable con su valor
5. Selecciona **Production** y **Preview** environments
6. Haz clic en **Save**

## ✅ **Después de configurar:**
- Vercel hará un nuevo deploy automáticamente
- Tu app estará lista para usar 
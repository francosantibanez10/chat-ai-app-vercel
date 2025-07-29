# Configuración de Firebase

## Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Authentication y Storage

## Paso 2: Configurar Authentication

1. En Firebase Console, ve a "Authentication" > "Sign-in method"
2. Habilita "Email/Password" y "Google"
3. Para Google, configura el OAuth consent screen

## Paso 3: Configurar Storage

1. En Firebase Console, ve a "Storage"
2. Crea un bucket de almacenamiento
3. Configura las reglas de seguridad:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Paso 4: Obtener configuración

1. En Firebase Console, ve a "Project settings" (ícono de engranaje)
2. En la sección "Your apps", crea una nueva app web
3. Copia la configuración que aparece

## Paso 5: Configurar variables de entorno

Crea o actualiza tu archivo `.env.local` con:

```env
# OpenAI API Key
OPENAI_API_KEY=tu_openai_api_key_aqui

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Paso 6: Verificar instalación

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Prueba crear una cuenta y subir archivos

## Notas importantes

- Asegúrate de que tu proyecto Firebase esté en el plan Blaze (pago por uso)
- Las reglas de Storage deben permitir acceso solo a usuarios autenticados
- Los archivos se almacenan en la ruta: `users/{userId}/chats/{chatId}/{filename}` 
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando configuración de Firebase...\n");

// Cargar variables de entorno desde .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ Archivo .env.local no encontrado");
  console.log(
    "💡 Crea un archivo .env.local en la raíz del proyecto con las variables de Firebase"
  );
  process.exit(1);
}

// Leer y parsear el archivo .env.local
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith("#")) {
    const [key, ...valueParts] = trimmedLine.split("=");
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join("=");
    }
  }
});

const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const exampleValues = [
  "tu_firebase_api_key",
  "tu_proyecto.firebaseapp.com",
  "tu_proyecto_id",
  "tu_proyecto.appspot.com",
  "123456789",
  "1:123456789:web:abcdef123456",
];

console.log("📋 Variables requeridas:");
let allGood = true;

requiredVars.forEach((varName, index) => {
  const value = envVars[varName];
  const exampleValue = exampleValues[index];

  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allGood = false;
  } else if (value === exampleValue) {
    console.log(`⚠️  ${varName}: VALOR DE EJEMPLO (${value})`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: Configurada`);
  }
});

console.log("\n📝 Resumen:");
if (allGood) {
  console.log(
    "✅ Todas las variables de Firebase están configuradas correctamente"
  );
  console.log("🚀 Tu aplicación debería funcionar sin problemas");
} else {
  console.log("❌ Hay problemas con la configuración de Firebase");
  console.log("\n🔧 Para solucionar:");
  console.log("1. Ve a https://console.firebase.google.com/");
  console.log("2. Selecciona tu proyecto");
  console.log("3. Ve a Configuración del proyecto > General");
  console.log('4. En "Tus apps", selecciona tu app web o crea una nueva');
  console.log("5. Copia los valores de configuración al archivo .env.local");
  console.log("\n📄 Ejemplo de .env.local:");
  console.log("NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_real");
  console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com");
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id");
  console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com");
  console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789");
  console.log("NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456");
}

process.exit(allGood ? 0 : 1);

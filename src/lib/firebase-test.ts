// Script de prueba para verificar la configuración de Firebase
export function testFirebaseConfig() {
  console.log("🔍 Verificando configuración de Firebase...");

  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Variables de entorno faltantes:", missingVars);
    return false;
  }

  console.log("✅ Todas las variables de entorno están configuradas");

  // Verificar que los valores no sean los valores de ejemplo
  const exampleValues = [
    "tu_firebase_api_key",
    "tu_proyecto.firebaseapp.com",
    "tu_proyecto_id",
    "tu_proyecto.appspot.com",
    "123456789",
    "1:123456789:web:abcdef123456",
  ];

  const hasExampleValues = requiredVars.some((varName, index) => {
    const value = process.env[varName];
    return value === exampleValues[index];
  });

  if (hasExampleValues) {
    console.error(
      "❌ Algunas variables tienen valores de ejemplo. Por favor, configura los valores reales."
    );
    return false;
  }

  console.log("✅ Todas las variables tienen valores reales");
  return true;
}

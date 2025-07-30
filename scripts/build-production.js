#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de producción...\n');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.');
  process.exit(1);
}

// Verificar variables de entorno
console.log('🔍 Verificando variables de entorno...');
try {
  execSync('npm run check-firebase', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Algunas variables de entorno pueden no estar configuradas correctamente.');
}

// Limpiar directorios de build anteriores
console.log('\n🧹 Limpiando builds anteriores...');
if (fs.existsSync('.next')) {
  execSync('rm -rf .next', { stdio: 'inherit' });
}
if (fs.existsSync('out')) {
  execSync('rm -rf out', { stdio: 'inherit' });
}

// Instalar dependencias si es necesario
console.log('\n📦 Verificando dependencias...');
try {
  execSync('npm ci --only=production', { stdio: 'inherit' });
} catch (error) {
  console.log('Instalando dependencias de desarrollo también...');
  execSync('npm ci', { stdio: 'inherit' });
}

// Ejecutar build
console.log('\n🔨 Ejecutando build de Next.js...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado exitosamente!');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}

// Verificar que el build se creó correctamente
if (!fs.existsSync('.next')) {
  console.error('❌ El directorio .next no se creó. El build falló.');
  process.exit(1);
}

console.log('\n🎉 Build de producción completado!');
console.log('\n📋 Próximos pasos:');
console.log('   Para Vercel: npm run deploy-vercel');
console.log('   Para Firebase: npm run deploy:firebase');
console.log('   Para probar localmente: npm start'); 
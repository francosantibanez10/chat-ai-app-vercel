#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwFs38Kte6fby7YKa8oFM8PFnukkxilzE",
  authDomain: "mineral-nebula-459522-a9.firebaseapp.com",
  projectId: "mineral-nebula-459522-a9",
  storageBucket: "mineral-nebula-459522-a9.firebasestorage.app",
  messagingSenderId: "881335335309",
  appId: "1:881335335309:web:8b764351f28046b1f3a5c4",
};

async function verifyFirebaseSetup() {
  console.log('🔍 Verificando configuración de Firebase...\n');

  try {
    // 1. Inicializar Firebase
    console.log('1. Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');

    // 2. Verificar Auth
    console.log('\n2. Verificando Firebase Auth...');
    const auth = getAuth(app);
    console.log('✅ Firebase Auth inicializado correctamente');

    // 3. Verificar Firestore
    console.log('\n3. Verificando Firestore...');
    const db = getFirestore(app);
    console.log('✅ Firestore inicializado correctamente');

    // 4. Intentar autenticación anónima
    console.log('\n4. Probando autenticación anónima...');
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Autenticación anónima exitosa');
      console.log(`   User ID: ${userCredential.user.uid}`);
    } catch (authError) {
      console.log('❌ Error en autenticación anónima:', authError.message);
    }

    // 5. Intentar leer colección de conversaciones
    console.log('\n5. Probando lectura de Firestore...');
    try {
      const conversationsRef = collection(db, 'conversations');
      const snapshot = await getDocs(conversationsRef);
      console.log('✅ Lectura de Firestore exitosa');
      console.log(`   Documentos encontrados: ${snapshot.size}`);
    } catch (firestoreError) {
      console.log('❌ Error en lectura de Firestore:', firestoreError.message);
      
      if (firestoreError.message.includes('permission')) {
        console.log('\n💡 El error de permisos puede ser porque:');
        console.log('   - El usuario no está autenticado');
        console.log('   - Las reglas de Firestore no están desplegadas');
        console.log('   - Las reglas son demasiado restrictivas');
      }
    }

    console.log('\n🎉 Verificación completada');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar verificación
verifyFirebaseSetup(); 
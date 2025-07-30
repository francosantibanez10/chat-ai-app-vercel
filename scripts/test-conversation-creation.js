const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwFs38Kte6fby7YKa8oFM8PFnukkxilzE",
  authDomain: "mineral-nebula-459522-a9.firebaseapp.com",
  projectId: "mineral-nebula-459522-a9",
  storageBucket: "mineral-nebula-459522-a9.firebasestorage.app",
  messagingSenderId: "881335335309",
  appId: "1:881335335309:web:8b764351f28046b1f3a5c4",
};

async function testConversationCreation() {
  console.log('🧪 Probando creación de conversaciones...\n');

  try {
    // 1. Inicializar Firebase
    console.log('1. Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');

    // 2. Autenticación anónima
    console.log('\n2. Autenticando usuario anónimo...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ Usuario autenticado: ${user.uid}`);

    // 3. Verificar conversaciones existentes
    console.log('\n3. Verificando conversaciones existentes...');
    try {
      const conversationsRef = collection(db, 'conversations');
      const snapshot = await getDocs(conversationsRef);
      console.log(`✅ Lectura exitosa. Conversaciones existentes: ${snapshot.size}`);
    } catch (error) {
      console.log('❌ Error leyendo conversaciones:', error.message);
    }

    // 4. Intentar crear una conversación de prueba
    console.log('\n4. Intentando crear conversación de prueba...');
    try {
      const testConversation = {
        title: 'Conversación de prueba',
        userId: user.uid,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'gpt-3.5-turbo',
        isPinned: false,
        isArchived: false
      };

      const docRef = await addDoc(collection(db, 'conversations'), testConversation);
      console.log('✅ Conversación creada exitosamente!');
      console.log(`   ID del documento: ${docRef.id}`);
      
      // 5. Verificar que se creó correctamente
      console.log('\n5. Verificando conversación creada...');
      const newSnapshot = await getDocs(conversationsRef);
      console.log(`✅ Total de conversaciones después de crear: ${newSnapshot.size}`);
      
    } catch (error) {
      console.log('❌ Error creando conversación:', error.message);
      console.log('\n💡 Posibles causas:');
      console.log('   - Reglas de Firestore demasiado restrictivas');
      console.log('   - Campos faltantes o incorrectos');
      console.log('   - Problemas de permisos');
      console.log('   - Índices faltantes');
    }

    console.log('\n🎉 Prueba completada');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar prueba
testConversationCreation(); 
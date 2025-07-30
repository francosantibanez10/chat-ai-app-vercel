#!/usr/bin/env node

async function testChatAPI() {
  console.log('🧪 Probando API del chat...\n');

  const testMessage = {
    messages: [
      {
        role: 'user',
        content: 'Hola, ¿cómo estás?'
      }
    ],
    model: 'gpt-4o',
    userId: 'test-user-123',
    sessionId: 'test-session-456'
  };

  try {
    console.log('📤 Enviando mensaje de prueba...');
    console.log('Mensaje:', testMessage.messages[0].content);

    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('\n📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      // La API devuelve un stream de texto, no JSON
      const text = await response.text();
      console.log('\n✅ Chat funcionando correctamente!');
      console.log('Respuesta recibida (primeros 200 caracteres):');
      console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      
      // Extraer el contenido de la respuesta de streaming
      const lines = text.split('\n');
      let content = '';
      
      for (const line of lines) {
        if (line.startsWith('0:"')) {
          // Extraer el contenido de las líneas que empiezan con 0:"
          const match = line.match(/0:"([^"]*)"/);
          if (match) {
            content += match[1];
          }
        }
      }
      
      if (content) {
        console.log('\n🎉 ¡Contenido extraído exitosamente!');
        console.log('Respuesta de la IA:', content);
      } else {
        console.log('\n⚠️ No se pudo extraer contenido claro de la respuesta');
        console.log('Formato de respuesta detectado:', text.substring(0, 100));
      }
    } else {
      const errorText = await response.text();
      console.log('\n❌ Error en la API:');
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.log('\n❌ Error de conexión:');
    console.log('Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev');
  }
}

// Ejecutar la prueba
testChatAPI();

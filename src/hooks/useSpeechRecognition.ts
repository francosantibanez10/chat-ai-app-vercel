import { useState, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar soporte del navegador
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsSupported(supported);
      
      if (!supported) {
        setError('El reconocimiento de voz no está soportado en este navegador');
      }
    };

    checkSupport();
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('El reconocimiento de voz no está soportado');
      return;
    }

    try {
      // Usar la API disponible
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('No se pudo inicializar el reconocimiento de voz');
        return;
      }

      const recognition = new SpeechRecognition();
      
      // Configuración
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES'; // Español
      recognition.maxAlternatives = 1;

      // Eventos
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Reconocimiento de voz iniciado');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        
        let errorMessage = 'Error en el reconocimiento de voz';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó voz. Inténtalo de nuevo.';
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono.';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso denegado para acceder al micrófono.';
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Servicio de reconocimiento no disponible.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Reconocimiento de voz finalizado');
      };

      // Iniciar reconocimiento
      recognition.start();
      
    } catch (err) {
      console.error('Error iniciando reconocimiento de voz:', err);
      setError('Error al iniciar el reconocimiento de voz');
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    // El reconocimiento se detendrá automáticamente cuando no detecte voz
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}; 
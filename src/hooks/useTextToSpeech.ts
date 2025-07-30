import { useState, useCallback } from 'react';

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Verificar si el navegador soporta TTS
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Obtener voces disponibles
  const getVoices = useCallback(() => {
    if (!isSupported) return [];
    
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(voice => voice.lang.startsWith('es') || voice.lang.startsWith('en'));
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Text-to-Speech no está soportado en este navegador');
      return;
    }

    // Detener cualquier reproducción actual
    if (currentUtterance) {
      window.speechSynthesis.cancel();
    }

    // Crear nueva utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Obtener voces disponibles y seleccionar la mejor
    const voices = getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'es-ES') || 
                          voices.find(voice => voice.lang.startsWith('es')) || 
                          voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Configurar opciones
    utterance.lang = 'es-ES'; // Español
    utterance.rate = 1.0; // Velocidad normal
    utterance.pitch = 1.0; // Tono normal
    utterance.volume = 1.0; // Volumen máximo

    // Event listeners
    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentUtterance(utterance);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Error en Text-to-Speech:', event);
      setIsPlaying(false);
      setCurrentUtterance(null);
    };

    // Iniciar reproducción
    window.speechSynthesis.speak(utterance);
  }, [isSupported, currentUtterance]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
    }
  }, [isSupported]);

  return {
    isPlaying,
    speak,
    stop,
    isSupported,
  };
}; 
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Detectar móvil por ancho de pantalla
      const isMobileByWidth = window.innerWidth < 768;
      
      // Detectar móvil por user agent
      const isMobileByUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Detectar móvil por touch capabilities
      const isMobileByTouch = 'ontouchstart' in window;
      
      setIsMobile(isMobileByWidth || isMobileByUA || isMobileByTouch);
    };

    // Verificar inicialmente
    checkIsMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}

// Hook para detectar si el teclado está abierto (iOS/Android)
export function useKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const checkKeyboardOpen = () => {
      // En iOS, cuando el teclado está abierto, la altura de la ventana cambia
      const heightDiff = window.visualViewport?.height || 0;
      const windowHeight = window.innerHeight;
      const threshold = windowHeight * 0.3; // 30% de la altura de la ventana
      
      setIsKeyboardOpen(heightDiff < windowHeight - threshold);
    };

    // Verificar cuando cambia el viewport
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboardOpen);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboardOpen);
      }
    };
  }, []);

  return isKeyboardOpen;
}

// Hook combinado para UI móvil
export function useMobileUI() {
  const isMobile = useIsMobile();
  const isKeyboardOpen = useKeyboardOpen();

  return {
    isMobile,
    isKeyboardOpen,
    isMobileWithKeyboard: isMobile && isKeyboardOpen,
  };
} 
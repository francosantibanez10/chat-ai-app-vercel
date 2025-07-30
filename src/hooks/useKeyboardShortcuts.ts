import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onNewChat?: () => void;
  onSearch?: () => void;
  onClose?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onSelect?: () => void;
  isEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onNewChat,
  onSearch,
  onClose,
  onNavigateUp,
  onNavigateDown,
  onSelect,
  isEnabled = true,
}: KeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Solo activar cuando no esté escribiendo en un input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Ctrl/Cmd + N: Nuevo chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      onNewChat?.();
    }

    // Ctrl/Cmd + F: Buscar
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      onSearch?.();
    }

    // Escape: Cerrar
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    }

    // Flechas para navegar
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onNavigateUp?.();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onNavigateDown?.();
    }

    // Enter: Seleccionar
    if (event.key === 'Enter') {
      event.preventDefault();
      onSelect?.();
    }
  }, [isEnabled, onNewChat, onSearch, onClose, onNavigateUp, onNavigateDown, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
} 
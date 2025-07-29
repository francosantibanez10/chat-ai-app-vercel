"use client";

import { Share, Edit3, Archive, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ConversationActionsMenuProps {
  conversationId: string;
  conversationTitle: string;
  onShare: (conversationId: string) => void;
  onRename: (conversationId: string, newTitle: string) => void;
  onArchive: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function ConversationActionsMenu({
  conversationId,
  conversationTitle,
  onShare,
  onRename,
  onArchive,
  onDelete,
  isOpen,
  onClose,
  triggerRef,
}: ConversationActionsMenuProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversationTitle);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calcular posición del menú basada en el botón trigger
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5, // 5px de separación
        left: rect.right - 180, // Alinear a la derecha del botón
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== conversationTitle) {
      onRename(conversationId, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewTitle(conversationTitle);
      setIsRenaming(false);
    }
  };

  if (!isOpen) return null;

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[180px]"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      <div className="p-1">
        {/* Compartir */}
        <button
          onClick={() => {
            onShare(conversationId);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
        >
          <Share className="w-4 h-4" />
          <span>Compartir</span>
        </button>

        {/* Cambiar nombre */}
        <button
          onClick={() => setIsRenaming(true)}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>Cambiar nombre</span>
        </button>

        {/* Archivar */}
        <button
          onClick={() => {
            onArchive(conversationId);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
        >
          <Archive className="w-4 h-4" />
          <span>Archivar</span>
        </button>

        {/* Eliminar */}
        <button
          onClick={() => {
            onDelete(conversationId);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );

  const renameModal = isRenaming ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 w-80">
        <h3 className="text-lg font-medium text-white mb-3">
          Cambiar nombre de la conversación
        </h3>
        <input
          ref={inputRef}
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nuevo nombre..."
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              setNewTitle(conversationTitle);
              setIsRenaming(false);
            }}
            className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleRename}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {menuContent}
      {renameModal}
    </>,
    document.body
  );
}

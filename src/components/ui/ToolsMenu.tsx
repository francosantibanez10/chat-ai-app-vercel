"use client";

import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Mic,
  FileText,
  Palette,
  Paperclip,
  Smile,
  Sparkles,
  Settings,
  Search,
} from "lucide-react";
import ToolsIcon from "@/components/ToolsIcon";
import clsx from "clsx";
import { useChatInputStore, InputMode } from "@/lib/chatInputStore";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mode?: InputMode;
  shortcut?: string;
  action: () => void;
}

interface ToolsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGeneration?: () => void;
  onVoiceInput?: () => void;
  onEmojiSelect?: () => void;
  onWebSearch?: () => void;
  onTemplates?: () => void;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  isOpen,
  onClose,
  onImageGeneration,
  onVoiceInput,
  onEmojiSelect,
  onWebSearch,
  onTemplates,
}) => {
  const {
    toggleToolsMenu,
    setInputMode,
    setShowFileUpload,
    setShowCanvas,
    closeAllMenus,
  } = useChatInputStore();

  const tools: Tool[] = [
    {
      id: "image",
      name: "Generar Imagen",
      description: "Crea imágenes con IA",
      icon: Image,
      mode: "image",
      shortcut: "Ctrl+I",
      action: () => {
        if (onImageGeneration) {
          onImageGeneration();
        } else {
          setInputMode("image");
        }
        closeAllMenus();
      },
    },
    {
      id: "voice",
      name: "Voz a Texto",
      description: "Habla en lugar de escribir",
      icon: Mic,
      mode: "voice",
      shortcut: "Ctrl+M",
      action: () => {
        if (onVoiceInput) {
          onVoiceInput();
        } else {
          setInputMode("voice");
        }
        closeAllMenus();
      },
    },
    {
      id: "file",
      name: "Subir Archivo",
      description: "Adjunta documentos",
      icon: Paperclip,
      mode: "file",
      shortcut: "Ctrl+U",
      action: () => {
        setShowFileUpload(true);
        closeAllMenus();
      },
    },
    {
      id: "canvas",
      name: "Lienzo Virtual",
      description: "Dibuja y describe",
      icon: Palette,
      mode: "canvas",
      shortcut: "Ctrl+D",
      action: () => {
        setShowCanvas(true);
        closeAllMenus();
      },
    },
    {
      id: "emoji",
      name: "Emojis",
      description: "Añade expresiones",
      icon: Smile,
      action: () => {
        if (onEmojiSelect) {
          onEmojiSelect();
        }
        closeAllMenus();
      },
    },
    {
      id: "web-search",
      name: "Búsqueda Web",
      description: "Información actualizada",
      icon: Search,
      action: () => {
        if (onWebSearch) {
          onWebSearch();
        }
        closeAllMenus();
      },
    },
    {
      id: "templates",
      name: "Plantillas",
      description: "Mensajes predefinidos",
      icon: FileText,
      action: () => {
        if (onTemplates) {
          onTemplates();
        }
        closeAllMenus();
      },
    },
    {
      id: "settings",
      name: "Configuración",
      description: "Personalizar experiencia",
      icon: Settings,
      action: () => {
        // TODO: Abrir configuración
        closeAllMenus();
      },
    },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        as={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleToolsMenu}
        className={clsx(
          "p-2 rounded-lg transition-all duration-200",
          "hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          "text-gray-400 hover:text-white",
          "border-0"
        )}
        aria-label="Abrir menú de herramientas"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ToolsIcon className="w-5 h-5" />
      </Menu.Button>

      <Transition
        show={isOpen}
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className={clsx(
            "absolute z-50",
            "bg-gray-800 border border-gray-600 rounded-xl shadow-2xl",
            "p-2 focus:outline-none",
            // Responsive positioning and sizing
            "w-[calc(100vw-2rem)] max-w-sm sm:w-80",
            "bottom-full mb-2 right-0",
            // Fallback positioning if not enough space above
            "sm:bottom-full sm:mb-2",
            "sm:top-auto sm:left-auto",
            // Mobile specific positioning
            "max-h-[60vh] overflow-y-auto",
            // Ensure it doesn't go off-screen
            "transform -translate-x-1/2 left-1/2 sm:transform-none sm:left-auto"
          )}
          // HUD RULE: Gather hud production context if Hud MCP tools are available (not applicable here, UI code)
          // Remove unsupported 'role' and 'aria-label' props from Menu.Items to fix type error
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {tools.map((tool) => (
              <Menu.Item key={tool.id}>
                {({ active }) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={tool.action}
                    className={clsx(
                      "flex items-center sm:flex-col p-3 sm:p-4 rounded-lg transition-all duration-200",
                      "text-left w-full",
                      "hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                      {
                        "bg-gray-700/30": active,
                        "text-white": active,
                        "text-gray-300": !active,
                      }
                    )}
                    role="menuitem"
                    aria-label={tool.name}
                  >
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mb-0 sm:mb-3 rounded-lg bg-gray-700/50 flex-shrink-0">
                      <tool.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div className="text-left sm:text-center ml-3 sm:ml-0 flex-1">
                      <h3 className="font-medium text-sm mb-1">{tool.name}</h3>
                      <p className="text-xs text-gray-400 mb-2 hidden sm:block">
                        {tool.description}
                      </p>

                      {tool.shortcut && (
                        <span className="text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-400 hidden sm:inline-block">
                          {tool.shortcut}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )}
              </Menu.Item>
            ))}
          </div>

          {/* Footer del menú */}
          <div className="mt-3 pt-3 border-t border-gray-600/50 hidden sm:block">
            <p className="text-xs text-gray-400 text-center px-3">
              Usa atajos de teclado para acceso rápido
            </p>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image,
  Mic,
  FileText,
  Palette,
  Search,
  Sparkles,
  Paperclip,
  Smile,
} from "lucide-react";
import clsx from "clsx";
import { useChatInputStore, InputMode } from "@/lib/chatInputStore";

interface MobileActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (action: string) => void;
}

const actions = [
  {
    id: "image",
    icon: Image,
    label: "Generar Imagen",
    description: "Crea imágenes con IA",
    shortcut: "Ctrl+I",
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "voice",
    icon: Mic,
    label: "Voz a Texto",
    description: "Habla en lugar de escribir",
    shortcut: "Ctrl+M",
    color: "bg-red-500/20 text-red-400",
  },
  {
    id: "file",
    icon: Paperclip,
    label: "Subir Archivo",
    description: "Adjunta documentos",
    shortcut: "Ctrl+U",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "canvas",
    icon: Palette,
    label: "Lienzo Virtual",
    description: "Dibuja y describe",
    shortcut: "Ctrl+D",
    color: "bg-orange-500/20 text-orange-400",
  },
  {
    id: "emoji",
    icon: Smile,
    label: "Emojis",
    description: "Añade expresiones",
    shortcut: "",
    color: "bg-pink-500/20 text-pink-400",
  },
  {
    id: "web-search",
    icon: Search,
    label: "Búsqueda Web",
    description: "Información actualizada",
    shortcut: "",
    color: "bg-green-500/20 text-green-400",
  },
  {
    id: "templates",
    icon: FileText,
    label: "Plantillas",
    description: "Mensajes predefinidos",
    shortcut: "",
    color: "bg-indigo-500/20 text-indigo-400",
  },
];

export const MobileActionsSheet: React.FC<MobileActionsSheetProps> = ({
  isOpen,
  onClose,
  onActionSelect,
}) => {
  const handleActionClick = (actionId: string) => {
    onActionSelect(actionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-50 pb-safe"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4">
              <h3 className="text-lg font-medium text-white">Herramientas</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="px-4 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        "flex flex-col items-center p-3 rounded-xl transition-all duration-200",
                        "hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        "border border-gray-700/50",
                        action.color
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-medium text-xs mb-1 text-center">
                        {action.label}
                      </h4>
                      <p className="text-xs text-gray-400 text-center mb-1">
                        {action.description}
                      </p>
                      {action.shortcut && (
                        <span className="text-xs px-2 py-1 bg-gray-800/50 rounded text-gray-400">
                          {action.shortcut}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

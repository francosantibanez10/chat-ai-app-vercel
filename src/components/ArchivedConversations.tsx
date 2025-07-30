"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  MessageCircle,
  Pin,
  MoreHorizontal,
  Edit,
  Share,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useConversations } from "@/contexts/ConversationsContext";

interface ArchivedConversationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchivedConversations({
  isOpen,
  onClose,
}: ArchivedConversationsProps) {
  const { archivedConversations, unarchiveConversation, deleteConversationById } = useConversations();
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Ahora";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  const handleUnarchive = async (conversationId: string) => {
    try {
      await unarchiveConversation(conversationId);
    } catch (error) {
      console.error("Error unarchiving conversation:", error);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.")) {
      try {
        await deleteConversationById(conversationId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const handleRename = async (conversationId: string) => {
    if (newTitle.trim() && newTitle !== "") {
      try {
        // Aquí se implementaría la función de renombrar
        console.log("Renaming conversation:", conversationId, "to:", newTitle);
        setIsRenaming(null);
        setNewTitle("");
      } catch (error) {
        console.error("Error renaming conversation:", error);
      }
    } else {
      setIsRenaming(null);
      setNewTitle("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === "Enter") {
      handleRename(conversationId);
    } else if (e.key === "Escape") {
      setIsRenaming(null);
      setNewTitle("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[75]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-[80vh] bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Archive className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">
                  Conversaciones Archivadas
                </h2>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
                  {archivedConversations.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {archivedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Archive className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No hay conversaciones archivadas</h3>
                  <p className="text-sm text-center">
                    Las conversaciones que archives aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-200"
                    >
                      {/* Icono */}
                      <div className="flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {isRenaming === conversation.id ? (
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onBlur={() => handleRename(conversation.id)}
                              onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                              className="text-sm font-medium bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <h3 className="text-sm font-medium text-gray-200 truncate">
                              {conversation.title}
                            </h3>
                          )}
                          {conversation.isPinned && (
                            <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {conversation.messageCount} mensajes
                          </span>
                          {conversation.timestamp && (
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(conversation.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleUnarchive(conversation.id)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                          title="Desarchivar"
                        >
                          <RotateCcw className="w-4 h-4 text-blue-400" />
                        </button>

                        <Menu as="div" className="relative">
                          <Menu.Button className="p-2 hover:bg-gray-700 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </Menu.Button>

                          <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 top-0 mr-1 w-44 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-[9999]">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setNewTitle(conversation.title);
                                        setIsRenaming(conversation.id);
                                      }}
                                      className={clsx(
                                        "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                                        active
                                          ? "bg-gray-700 text-white"
                                          : "text-gray-300"
                                      )}
                                    >
                                      <Edit className="w-4 h-4" />
                                      <span>Cambiar nombre</span>
                                    </button>
                                  )}
                                </Menu.Item>

                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDelete(conversation.id)}
                                      className={clsx(
                                        "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                                        active
                                          ? "bg-gray-700 text-white"
                                          : "text-gray-300"
                                      )}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Eliminar permanentemente</span>
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Las conversaciones archivadas se mantienen hasta que las elimines
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
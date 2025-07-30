"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Pin,
  MoreHorizontal,
  Edit,
  Share,
  Archive,
  Trash2,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: Date;
  isPinned?: boolean;
  isSelected?: boolean;
}

interface VirtualizedConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onShareConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  height?: number;
  itemHeight?: number;
}

const ConversationItem: React.FC<{
  conversation: Conversation;
  onSelect: (id: string) => void;
  onPin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onShare?: (id: string) => void;
  onArchive?: (id: string) => void;
}> = ({
  conversation,
  onSelect,
  onPin,
  onDelete,
  onRename,
  onShare,
  onArchive,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);

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

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      onRename?.(conversation.id, newTitle.trim());
    } else {
      setNewTitle(conversation.title);
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewTitle(conversation.title);
      setIsRenaming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "group flex items-center space-x-3 p-4 cursor-pointer transition-all duration-200",
        "hover:bg-gray-800/50 rounded-lg mx-2",
        {
          "bg-gray-800/30 border-l-2 border-blue-500": conversation.isSelected,
          "bg-gray-800/20": conversation.isPinned && !conversation.isSelected,
        }
      )}
      onClick={() => onSelect(conversation.id)}
    >
      {/* Icono de conversación */}
      <div className="flex-shrink-0">
        <MessageCircle
          className={clsx(
            "w-5 h-5",
            conversation.isSelected ? "text-blue-400" : "text-gray-400"
          )}
        />
      </div>

      {/* Contenido de la conversación */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {isRenaming ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="text-sm font-medium bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h3
              className={clsx(
                "text-sm font-medium truncate",
                conversation.isSelected ? "text-white" : "text-gray-200"
              )}
            >
              {conversation.title}
            </h3>
          )}
          {conversation.isPinned && (
            <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
          )}
        </div>

        {conversation.lastMessage && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {conversation.lastMessage}
          </p>
        )}
      </div>

      {/* Timestamp y acciones */}
      <div
        className="flex items-center space-x-2 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {conversation.timestamp && (
          <span className="text-xs text-gray-500">
            {formatTimestamp(conversation.timestamp)}
          </span>
        )}

        <div className="flex items-center space-x-1 opacity-100 transition-opacity">
          {onPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(conversation.id);
              }}
              className="p-1 hover:bg-gray-600 rounded transition-colors"
              title={conversation.isPinned ? "Desanclar" : "Anclar"}
            >
              <Pin
                className={clsx(
                  "w-3 h-3",
                  conversation.isPinned ? "text-yellow-400" : "text-gray-400"
                )}
              />
            </button>
          )}

          {/* Menú de acciones */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Menu as="div" className="relative">
              <Menu.Button
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
                title="Más opciones"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-400" />
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
                    {onRename && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsRenaming(true);
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
                    )}

                    {onShare && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShare(conversation.id);
                            }}
                            className={clsx(
                              "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-gray-700 text-white"
                                : "text-gray-300"
                            )}
                          >
                            <Share className="w-4 h-4" />
                            <span>Compartir</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {onArchive && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchive(conversation.id);
                            }}
                            className={clsx(
                              "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-gray-700 text-white"
                                : "text-gray-300"
                            )}
                          >
                            <Archive className="w-4 h-4" />
                            <span>Archivar</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {onDelete && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer."
                                )
                              ) {
                                onDelete(conversation.id);
                              }
                            }}
                            className={clsx(
                              "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-gray-700 text-white"
                                : "text-gray-300"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const VirtualizedConversationList: React.FC<
  VirtualizedConversationListProps
> = ({
  conversations,
  onSelectConversation,
  onPinConversation,
  onDeleteConversation,
  onRenameConversation,
  onShareConversation,
  onArchiveConversation,
  height = 400,
  itemHeight = 80,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">No hay conversaciones</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onSelect={onSelectConversation}
            onPin={onPinConversation}
            onDelete={onDeleteConversation}
            onRename={onRenameConversation}
            onShare={onShareConversation}
            onArchive={onArchiveConversation}
          />
        ))}
      </div>
    </div>
  );
};

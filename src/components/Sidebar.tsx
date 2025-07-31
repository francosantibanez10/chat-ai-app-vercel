"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  BookOpen,
  User,
  Crown,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Pin,
  MoreHorizontal,
  Search,
  Trash2,
  Archive,
  Share,
  Edit,
} from "lucide-react";
import { Menu, Transition, Popover } from "@headlessui/react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/contexts/ConversationsContext";
import { useRouter } from "next/navigation";
import ImageLibrary from "./ImageLibrary";
import { SearchInput } from "./ui/SearchInput";
import { VirtualizedConversationList } from "./ui/VirtualizedConversationList";
import { ConversationSkeleton } from "./ui/SkeletonLoader";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDebounce } from "@/hooks/useDebounce";
import clsx from "clsx";
import ArchivedConversations from "./ArchivedConversations";

interface SidebarProps {
  selectedChatId?: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenPlans?: () => void;
  onChatSelect?: (chatId: string) => void;
}

export default function Sidebar({
  selectedChatId,
  onClose,
  collapsed = false,
  onToggleCollapse,
  onOpenPlans,
  onChatSelect,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  const { user, logout } = useAuth();
  const {
    conversations,
    isLoading,
    createNewConversation,
    loadConversation,
    deleteConversationById,
    updateTitle,
    shareConversation,
    archiveConversation,
    pinConversation,
  } = useConversations();
  const router = useRouter();

  // Estados mejorados
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce para búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Referencias
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Filtrar conversaciones con debounce
  const filteredConversations = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return conversations;

    return conversations.filter((chat) =>
      chat.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [conversations, debouncedSearchTerm]);

  // Agrupar conversaciones por estado (placeholder para futura implementación de pinned)
  const groupedConversations = useMemo(() => {
    const pinned: any[] = []; // TODO: Implementar lógica de pinned
    const unpinned = filteredConversations;
    return { pinned, unpinned };
  }, [filteredConversations]);

  // Handlers mejorados
  const handleNewChat = async () => {
    try {
      const newChatId = await createNewConversation();
      await loadConversation(newChatId);
      router.push(`/chat/${newChatId}`);
      onChatSelect?.(newChatId);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      await loadConversation(chatId);
      router.push(`/chat/${chatId}`);
      onChatSelect?.(chatId);
      setSelectedIndex(-1); // Reset selection
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handlePinConversation = async (chatId: string) => {
    try {
      await pinConversation(chatId);
    } catch (error) {
      console.error("Error pinning conversation:", error);
    }
  };

  const handleDeleteConversation = async (chatId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta conversación?")) {
      try {
        await deleteConversationById(chatId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const handleShareConversation = async (chatId: string) => {
    try {
      await shareConversation(chatId);
    } catch (error) {
      console.error("Error sharing conversation:", error);
    }
  };

  const handleRenameConversation = async (chatId: string, newTitle: string) => {
    try {
      await updateTitle(chatId, newTitle);
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  };

  const handleArchiveConversation = async (chatId: string) => {
    try {
      await archiveConversation(chatId);
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  const handleImageLibraryClick = () => {
    setIsImageLibraryOpen(true);
  };

  // Atajos de teclado
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSearch: () => searchInputRef.current?.focus(),
    onClose: onClose,
    onNavigateUp: () => setSelectedIndex((prev) => Math.max(0, prev - 1)),
    onNavigateDown: () =>
      setSelectedIndex((prev) =>
        Math.min(filteredConversations.length - 1, prev + 1)
      ),
    onSelect: () => {
      if (selectedIndex >= 0 && selectedIndex < filteredConversations.length) {
        handleSelectChat(filteredConversations[selectedIndex].id);
      }
    },
    isEnabled: !isSearchFocused,
  });

  // Reset selected index when conversations change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredConversations.length]);

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && !collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[55] md:hidden"
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        style={{
          width: collapsed ? 64 : 280,
          maxWidth: collapsed ? 64 : 280,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "sidebar-container h-full md:h-screen flex flex-col bg-gray-950 border-r border-gray-800 overflow-x-visible",
          "fixed md:absolute md:left-0 md:top-0 z-[70] left-0"
        )}
      >
        {/* Header */}
        <motion.div
          className={clsx(
            "flex items-center p-3 relative",
            collapsed ? "justify-center" : "justify-between"
          )}
          initial={false}
          animate={{
            padding: collapsed ? "12px 8px" : "12px",
          }}
        >
          <motion.div
            className="flex items-center space-x-2"
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              scale: collapsed ? 0.8 : 1,
            }}
          >
            <motion.div
              className="w-6 h-6 bg-black rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <motion.div
                className="w-3 h-3 bg-white"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <span className="text-sm font-medium text-white">Rubi</span>
          </motion.div>

          <div
            className={clsx(
              "flex items-center space-x-1",
              collapsed
                ? "absolute inset-0 flex items-center justify-center"
                : ""
            )}
          >
            {/* Botón cerrar en móvil */}
            <motion.button
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-gray-400" />
            </motion.button>

            {/* Botón colapsar en desktop */}
            <motion.button
              onClick={onToggleCollapse}
              className="hidden md:block p-2 hover:bg-gray-800 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden overflow-x-hidden">
          {/* Navigation Buttons */}
          <div className={clsx("space-y-1", collapsed ? "p-1" : "p-2")}>
            <motion.button
              onClick={handleImageLibraryClick}
              className={clsx(
                "w-full flex items-center rounded-lg transition-all duration-200",
                collapsed ? "p-2 justify-center" : "p-2",
                "hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "text-gray-300 hover:text-white"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={collapsed ? "Biblioteca" : undefined}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-sm"
                  >
                    Biblioteca
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={handleNewChat}
              className={clsx(
                "w-full flex items-center rounded-lg transition-all duration-200",
                collapsed ? "p-2 justify-center" : "p-2",
                "hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "text-gray-300 hover:text-white"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={collapsed ? "Nuevo chat" : undefined}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-sm"
                  >
                    Nuevo chat
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-2 pb-2"
              >
                <SearchInput
                  onSearch={setSearchTerm}
                  placeholder="Buscar conversaciones..."
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversations List */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible">
            {isLoading ? (
              <div className="p-2">
                <ConversationSkeleton count={5} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {searchTerm
                      ? "No se encontraron conversaciones"
                      : "No hay conversaciones"}
                  </p>
                </div>
              </div>
            ) : (
              <VirtualizedConversationList
                conversations={filteredConversations.map((chat, index) => ({
                  id: chat.id,
                  title: chat.title,
                  lastMessage: `${chat.messageCount} mensajes`, // Placeholder
                  timestamp: chat.updatedAt,
                  isPinned: chat.isPinned || false,
                  isSelected:
                    selectedChatId === chat.id || selectedIndex === index,
                }))}
                onSelectConversation={handleSelectChat}
                onPinConversation={handlePinConversation}
                onDeleteConversation={handleDeleteConversation}
                onRenameConversation={handleRenameConversation}
                onShareConversation={handleShareConversation}
                onArchiveConversation={handleArchiveConversation}
                height={0} // Usar flex-1 en lugar de altura fija
                itemHeight={80}
              />
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-800 p-2">
          <Menu as="div" className="relative">
            <Menu.Button
              className={clsx(
                "w-full flex items-center p-2 rounded-lg transition-all duration-200",
                "hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "text-gray-300 hover:text-white"
              )}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-1.5 h-1.5 text-yellow-900" />
                </div>
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 flex-1 text-left"
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {user?.email || "Usuario"}
                    </div>
                    <div className="text-xs text-yellow-500">Plus</div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <Menu.Items className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-2rem)] bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onOpenPlans?.()}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Cambiar a un plan superior</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/settings/customize")}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        )}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Personalizar Rubi-gpt</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/settings/general")}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        )}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/help")}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        )}
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Ayuda</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setIsArchivedOpen(true)}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        )}
                      >
                        <Archive className="w-4 h-4" />
                        <span>Conversaciones archivadas</span>
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-gray-700 my-1" />

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors",
                          active ? "bg-gray-700 text-red-400" : "text-red-400"
                        )}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Image Library Modal */}
        <ImageLibrary
          isOpen={isImageLibraryOpen}
          onClose={() => setIsImageLibraryOpen(false)}
        />

        {/* Archived Conversations Modal */}
        <ArchivedConversations
          isOpen={isArchivedOpen}
          onClose={() => setIsArchivedOpen(false)}
        />
      </div>
    </>
  );
}

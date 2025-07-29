"use client";

import {
  Plus,
  Search,
  BookOpen,
  Sigma,
  Play,
  Circle,
  User,
  Crown,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronDown,
  MessageSquare,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/contexts/ConversationsContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ConversationActionsMenu from "./ConversationActionsMenu";
import ImageLibrary from "./ImageLibrary";

interface SidebarProps {
  selectedChatId?: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenPlans?: () => void;
}

export default function Sidebar({
  selectedChatId,
  onClose,
  collapsed = false,
  onToggleCollapse,
  onOpenPlans,
}: SidebarProps) {
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
  } = useConversations();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [actionsMenuOpen, setActionsMenuOpen] = useState<string | null>(null);
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsProfileMenuOpen(false);
  };

  const handleNewChat = async () => {
    try {
      const newChatId = await createNewConversation();
      await loadConversation(newChatId);
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      await loadConversation(chatId);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar esta conversación?")) {
      try {
        await deleteConversationById(chatId);
        if (selectedChatId === chatId) {
          router.push("/chat");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const handleActionsMenuToggle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsMenuOpen(actionsMenuOpen === chatId ? null : chatId);
  };

  const handleShareConversation = async (conversationId: string) => {
    try {
      await shareConversation(conversationId);
    } catch (error) {
      console.error("Error sharing conversation:", error);
    }
  };

  const handleRenameConversation = async (
    conversationId: string,
    newTitle: string
  ) => {
    try {
      await updateTitle(conversationId, newTitle);
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId);
      if (selectedChatId === conversationId) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta conversación?")) {
      try {
        await deleteConversationById(conversationId);
        if (selectedChatId === conversationId) {
          router.push("/chat");
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const handleImageLibraryClick = () => {
    setIsImageLibraryOpen(true);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatear fecha
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Ahora";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="w-full h-screen bg-gray-950 text-gray-300 flex flex-col relative z-50">
      {/* Header con logo */}
      <div className="pl-3 pr-1 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-sm"></div>
          </div>
          {!collapsed && <span className="text-sm font-medium">Rubi</span>}
        </div>

        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Botón colapsar en desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:block p-1.5 hover:bg-gray-800 rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Main Navigation - Más compacto */}
      <div className="flex-1 pl-2 pr-0 py-2 space-y-1 overflow-y-auto">
        {/* Botones de funcionalidades - ARRIBA */}
        <button
          onClick={handleImageLibraryClick}
          className={`w-full flex items-center ${
            collapsed ? "justify-center" : "space-x-3"
          } p-2 pr-1 rounded-lg hover:bg-gray-800 transition-colors`}
          title={collapsed ? "Biblioteca" : undefined}
        >
          <BookOpen className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Biblioteca</span>}
        </button>

        {/* Separador */}
        <div className="border-t border-gray-700 my-2"></div>

        {/* Elementos de navegación - ABAJO */}
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center ${
            collapsed ? "justify-center" : "space-x-3"
          } p-2 pr-1 rounded-lg hover:bg-gray-800 transition-colors`}
          title={collapsed ? "Nuevo chat" : undefined}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Nuevo chat</span>}
        </button>

        {/* Barra de búsqueda */}
        {!collapsed && (
          <div className="relative px-2 py-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
            />
          </div>
        )}

        {/* Lista de conversaciones */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="px-2 py-2 text-center">
              <div className="text-xs text-gray-400">Cargando...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-2 py-2 text-center">
              <div className="text-xs text-gray-400">
                {searchTerm
                  ? "No se encontraron conversaciones"
                  : "No hay conversaciones"}
              </div>
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <div
                key={chat.id}
                className={`relative group ${collapsed ? "px-1" : "px-2"}`}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <button
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center" : "space-x-3"
                  } p-2 pr-1 rounded-lg transition-colors ${
                    selectedChatId === chat.id
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                  title={collapsed ? chat.title : undefined}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm truncate">{chat.title}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(chat.updatedAt)} • {chat.messageCount}{" "}
                        mensajes
                      </div>
                    </div>
                  )}
                </button>

                {/* Botón de acciones (solo visible en hover) */}
                {!collapsed && hoveredChatId === chat.id && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <button
                      ref={actionsButtonRef}
                      onClick={(e) => handleActionsMenuToggle(chat.id, e)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Más opciones"
                    >
                      <MoreHorizontal className="w-3 h-3 text-gray-400" />
                    </button>

                    {/* Menú de acciones */}
                    <ConversationActionsMenu
                      conversationId={chat.id}
                      conversationTitle={chat.title}
                      onShare={handleShareConversation}
                      onRename={handleRenameConversation}
                      onArchive={handleArchiveConversation}
                      onDelete={handleDeleteConversation}
                      isOpen={actionsMenuOpen === chat.id}
                      onClose={() => setActionsMenuOpen(null)}
                      triggerRef={actionsButtonRef}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="pl-2 pr-0 py-2 border-t border-gray-700">
        <div className="relative" ref={menuRef}>
          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : "space-x-3"
            } p-2 pr-1 rounded-lg hover:bg-gray-800 transition-colors`}
            title={collapsed ? "Perfil" : undefined}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-1.5 h-1.5 text-yellow-900" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user?.email || "Usuario"}
                  </div>
                  <div className="text-xs text-yellow-500">Plus</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && !collapsed && (
            <div
              className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50"
              style={{
                minWidth: "280px",
                maxWidth: "320px",
                width: "max-content",
              }}
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    handleMenuClose();
                    onOpenPlans?.();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Cambiar a un plan superior</span>
                </button>

                <button
                  onClick={() => {
                    handleMenuClose();
                    router.push("/settings/customize");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Personalizar Rubi-gpt</span>
                </button>

                <button
                  onClick={() => {
                    handleMenuClose();
                    router.push("/settings/general");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Configuración</span>
                </button>

                <button
                  onClick={() => {
                    handleMenuClose();
                    router.push("/help");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Ayuda</span>
                </button>

                <div className="border-t border-gray-700 my-1"></div>

                <button
                  onClick={() => {
                    handleMenuClose();
                    logout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Library Modal */}
      <ImageLibrary
        isOpen={isImageLibraryOpen}
        onClose={() => setIsImageLibraryOpen(false)}
      />
    </div>
  );
}

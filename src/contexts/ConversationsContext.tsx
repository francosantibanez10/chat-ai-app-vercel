"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Conversation,
  ConversationSummary,
  Message,
  createConversation,
  getConversation,
  getUserConversations,
  getArchivedConversations,
  addMessageToConversation,
  updateConversationTitle,
  deleteConversation,
  updateConversationModel,
  updateConversationPin,
  updateConversationArchive,
} from "@/lib/firebase/conversations";
import { toast } from "react-hot-toast";

interface ConversationsContextType {
  conversations: ConversationSummary[];
  archivedConversations: ConversationSummary[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  createNewConversation: () => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  addMessage: (
    conversationId: string,
    message: Omit<Message, "id" | "timestamp">
  ) => Promise<void>;
  updateTitle: (conversationId: string, title: string) => Promise<void>;
  deleteConversationById: (conversationId: string) => Promise<void>;
  updateModel: (conversationId: string, model: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshArchivedConversations: () => Promise<void>;
  clearCurrentConversation: () => void;

  // Nuevas acciones
  shareConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error(
      "useConversations must be used within ConversationsProvider"
    );
  }
  return context;
};

interface ConversationsProviderProps {
  children: ReactNode;
}

export const ConversationsProvider: React.FC<ConversationsProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<
    ConversationSummary[]
  >([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Función refreshConversations optimizada
  const refreshConversations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userConversations = await getUserConversations(user.uid, false);
      setConversations(userConversations);
    } catch (err) {
      console.error("Error refreshing conversations:", err);
      setError("Error al cargar conversaciones");
    }
  }, [user?.uid]);

  // Función para refrescar conversaciones archivadas
  const refreshArchivedConversations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const archivedConversations = await getArchivedConversations(user.uid);
      setArchivedConversations(archivedConversations);
    } catch (err) {
      console.error("Error refreshing archived conversations:", err);
      setError("Error al cargar conversaciones archivadas");
    }
  }, [user?.uid]);

  // Función para actualizar conversación actual sin dependencias circulares
  const updateCurrentConversation = useCallback(
    async (conversationId: string) => {
      try {
        const conversation = await getConversation(conversationId);
        setCurrentConversation(conversation);
      } catch (err) {
        console.error("Error updating current conversation:", err);
      }
    },
    []
  );

  // Función para actualizar lista de conversaciones sin dependencias circulares
  const updateConversationsList = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
    } catch (err) {
      console.error("Error updating conversations list:", err);
    }
  }, [user?.uid]);

  // Todas las funciones optimizadas sin dependencias circulares
  const createNewConversation = useCallback(async () => {
    if (!user?.uid) throw new Error("Usuario no autenticado");
    setIsLoading(true);
    try {
      const newConversationId = await createConversation(user.uid);
      console.log(
        "🔧 [DEBUG] Context: createNewConversation retornó ID:",
        newConversationId
      );
      await updateConversationsList();
      return newConversationId;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, updateConversationsList]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;

      // Evitar cargar la misma conversación múltiples veces
      if (currentConversation?.id === conversationId && !isLoading) {
        return;
      }

      setIsLoading(true);
      try {
        const conversation = await getConversation(conversationId);
        setCurrentConversation(conversation);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error cargando conversación"
        );
        console.error("Error loading conversation:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.uid] // ✅ Removidas las dependencias que causaban el bucle
  );

  const addMessage = useCallback(
    async (
      conversationId: string,
      message: Omit<Message, "id" | "timestamp">
    ) => {
      if (!user?.uid) return;
      try {
        await addMessageToConversation(conversationId, message);
        // Solo actualizar la conversación actual si es la misma
        if (currentConversation?.id === conversationId) {
          await updateCurrentConversation(conversationId);
        }
      } catch (err) {
        console.error("Error adding message:", err);
        toast.error("Error al agregar mensaje");
      }
    },
    [user?.uid, currentConversation?.id, updateCurrentConversation]
  );

  const updateTitle = useCallback(
    async (conversationId: string, title: string) => {
      if (!user?.uid) return;
      try {
        await updateConversationTitle(conversationId, title);
        await updateConversationsList();
        // Actualizar conversación actual si es la misma
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
        }
      } catch (err) {
        console.error("Error updating title:", err);
        toast.error("Error al actualizar título");
      }
    },
    [user?.uid, currentConversation?.id, updateConversationsList]
  );

  const deleteConversationById = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;
      try {
        await deleteConversation(conversationId);
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
        await updateConversationsList();
        toast.success("Conversación eliminada");
      } catch (err) {
        console.error("Error deleting conversation:", err);
        toast.error("Error al eliminar conversación");
      }
    },
    [user?.uid, currentConversation?.id, updateConversationsList]
  );

  const updateModel = useCallback(
    async (conversationId: string, model: string) => {
      if (!user?.uid) return;
      try {
        await updateConversationModel(conversationId, model);
        // Actualizar conversación actual si es la misma
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) => (prev ? { ...prev, model } : null));
        }
      } catch (err) {
        console.error("Error updating model:", err);
        toast.error("Error al actualizar modelo");
      }
    },
    [user?.uid, currentConversation?.id]
  );

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  const shareConversation = useCallback(async (conversationId: string) => {
    try {
      // Cargar la conversación completa
      const conversation = await getConversation(conversationId);
      if (!conversation) {
        toast.error("Conversación no encontrada");
        return;
      }

      // Crear un objeto con la información de la conversación
      const shareData = {
        title: conversation.title,
        messages: conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        createdAt: conversation.createdAt,
        model: conversation.model,
      };

      // Convertir a JSON y crear un blob
      const jsonString = JSON.stringify(shareData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });

      // Crear URL del blob
      const url = URL.createObjectURL(blob);

      // Crear enlace de descarga
      const a = document.createElement("a");
      a.href = url;
      a.download = `${conversation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_conversation.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar URL
      URL.revokeObjectURL(url);

      toast.success("Conversación exportada como JSON");
    } catch (err) {
      console.error("Error sharing conversation:", err);
      toast.error("Error al exportar conversación");
    }
  }, []);

  const archiveConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;
      try {
        // Encontrar la conversación actual
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        // Actualizar el estado local inmediatamente para UI responsiva
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        setArchivedConversations((prev) => [conversation, ...prev]);

        // Persistir en Firebase
        await updateConversationArchive(conversationId, true);

        toast.success("Conversación archivada");
      } catch (err) {
        console.error("Error archiving conversation:", err);
        toast.error("Error al archivar conversación");

        // Revertir el estado local si falla
        setConversations((prev) => [...prev, conversation]);
        setArchivedConversations((prev) =>
          prev.filter((c) => c.id !== conversationId)
        );
      }
    },
    [user?.uid, conversations]
  );

  const unarchiveConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;
      try {
        // Encontrar la conversación archivada
        const conversation = archivedConversations.find(
          (c) => c.id === conversationId
        );
        if (!conversation) return;

        // Actualizar el estado local inmediatamente para UI responsiva
        setArchivedConversations((prev) =>
          prev.filter((c) => c.id !== conversationId)
        );
        setConversations((prev) => [conversation, ...prev]);

        // Persistir en Firebase
        await updateConversationArchive(conversationId, false);

        toast.success("Conversación desarchivada");
      } catch (err) {
        console.error("Error unarchiving conversation:", err);
        toast.error("Error al desarchivar conversación");

        // Revertir el estado local si falla
        setArchivedConversations((prev) => [...prev, conversation]);
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      }
    },
    [user?.uid, archivedConversations]
  );

  const pinConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;
      try {
        // Encontrar la conversación actual
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        // Toggle el estado de pin
        const isCurrentlyPinned = conversation.isPinned || false;
        const newPinState = !isCurrentlyPinned;

        // Actualizar el estado local inmediatamente para UI responsiva
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, isPinned: newPinState } : c
          )
        );

        // Persistir en Firebase
        await updateConversationPin(conversationId, newPinState);

        toast.success(
          newPinState ? "Conversación anclada" : "Conversación desanclada"
        );
      } catch (err) {
        console.error("Error pinning conversation:", err);
        toast.error("Error al anclar conversación");

        // Revertir el estado local si falla
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
          )
        );
      }
    },
    [user?.uid, conversations]
  );

  // Memoizar el valor del contexto para evitar re-renderizados
  const contextValue = useMemo(
    () => ({
      conversations,
      archivedConversations,
      currentConversation,
      isLoading,
      error,
      createNewConversation,
      loadConversation,
      addMessage,
      updateTitle,
      deleteConversationById,
      updateModel,
      refreshConversations,
      refreshArchivedConversations,
      clearCurrentConversation,
      shareConversation,
      archiveConversation,
      unarchiveConversation,
      pinConversation,
    }),
    [
      conversations,
      archivedConversations,
      currentConversation,
      isLoading,
      error,
      createNewConversation,
      loadConversation,
      addMessage,
      updateTitle,
      deleteConversationById,
      updateModel,
      refreshConversations,
      refreshArchivedConversations,
      clearCurrentConversation,
      shareConversation,
      archiveConversation,
      unarchiveConversation,
      pinConversation,
    ]
  );

  // Cargar conversaciones solo cuando el usuario cambie
  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setArchivedConversations([]);
      setCurrentConversation(null);
      setHasLoaded(false);
      return;
    }

    if (!hasLoaded) {
      setHasLoaded(true);
      refreshConversations();
      refreshArchivedConversations();
    }
  }, [
    user?.uid,
    hasLoaded,
    refreshConversations,
    refreshArchivedConversations,
  ]);

  return (
    <ConversationsContext.Provider value={contextValue}>
      {children}
    </ConversationsContext.Provider>
  );
};

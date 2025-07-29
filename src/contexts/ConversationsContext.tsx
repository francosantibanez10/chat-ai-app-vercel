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
  addMessageToConversation,
  updateConversationTitle,
  deleteConversation,
  updateConversationModel,
} from "@/lib/firebase/conversations";
import { toast } from "react-hot-toast";

interface ConversationsContextType {
  conversations: ConversationSummary[];
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
  clearCurrentConversation: () => void;

  // Nuevas acciones
  shareConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
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
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Función refreshConversations optimizada
  const refreshConversations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
    } catch (err) {
      console.error("Error refreshing conversations:", err);
      setError("Error al cargar conversaciones");
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
      const newConversation = await createConversation(user.uid);
      await updateConversationsList();
      return newConversation.id;
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
    [user?.uid, currentConversation?.id, isLoading]
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
    // Implementar lógica de compartir
    console.log("Sharing conversation:", conversationId);
  }, []);

  const archiveConversation = useCallback(async (conversationId: string) => {
    // Implementar lógica de archivar
    console.log("Archiving conversation:", conversationId);
  }, []);

  // Memoizar el valor del contexto para evitar re-renderizados
  const contextValue = useMemo(
    () => ({
      conversations,
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
      clearCurrentConversation,
      shareConversation,
      archiveConversation,
    }),
    [
      conversations,
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
      clearCurrentConversation,
      shareConversation,
      archiveConversation,
    ]
  );

  // Cargar conversaciones solo cuando el usuario cambie
  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setCurrentConversation(null);
      setHasLoaded(false);
      return;
    }

    if (!hasLoaded) {
      setHasLoaded(true);
      refreshConversations();
    }
  }, [user?.uid, hasLoaded, refreshConversations]);

  return (
    <ConversationsContext.Provider value={contextValue}>
      {children}
    </ConversationsContext.Provider>
  );
};

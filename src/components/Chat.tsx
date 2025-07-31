"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { MoreHorizontal, Menu, ChevronDown } from "lucide-react";
import { useChat } from "ai/react";
import { ChatMessage } from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import NewChatIcon from "./NewChatIcon";
import ShareIcon from "./ShareIcon";
import ActionsMenu from "./ActionsMenu";
import GeneratedFileViewer from "./GeneratedFileViewer";
import FileGenerationHelp from "./FileGenerationHelp";
import PlanLimitsDisplay from "./PlanLimitsDisplay";
import PlanUpgradeModal from "./PlanUpgradeModal";
import { useSettings } from "@/contexts/SettingsContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useConversations } from "@/contexts/ConversationsContext";
import { usePlan } from "@/contexts/PlanContext";
import { useImageLibrary } from "@/contexts/ImageLibraryContext";
import { useRouter } from "next/navigation";
import { UserPlan } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import {
  getConversation,
  updateMessageInConversation,
  deleteMessageFromConversation,
} from "@/lib/firebase/conversations";
import { toast } from "react-hot-toast";
import { submitFeedback } from "@/lib/feedback";
import { submitReport } from "@/lib/reports";
import { retryAI, retryFirebase } from "@/lib/retryManager";
import {
  executeWithAIFallback,
  executeWithFirebaseFallback,
} from "@/lib/fallbackManager";
import { createError } from "@/lib/errorHandler";
import { ErrorNotification } from "./ErrorNotification";
import { ErrorDashboard } from "./ErrorDashboard";
import {
  canSendMessage,
  canCreateConversation,
  incrementMessageCount,
  incrementConversationCount,
  getRemainingMessages,
  getRemainingConversations,
} from "@/lib/anonymousLimits";
import { AnonymousLimitModal } from "./AnonymousLimitModal";

// Extender el tipo Message para incluir metadata
interface ExtendedMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  createdAt?: Date;
  metadata?: {
    mathProblem?: any;
    tasks?: any[];
    contextAnalysis?: any;
    queryType?: string;
    tokens?: { input: number; output: number };
  };
}

interface ChatProps {
  onMenuClick?: () => void;
  conversationId?: string;
}

const Chat = React.memo(function Chat({
  onMenuClick,
  conversationId,
}: ChatProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<{
    buffer: ArrayBuffer;
    contentType: string;
    filename: string;
    isDownloadable: boolean;
  } | null>(null);
  const [planError, setPlanError] = useState<{
    isOpen: boolean;
    currentPlan: UserPlan;
    suggestedPlan: UserPlan;
    feature: string;
  } | null>(null);

  // Estado para el modal de límites anónimos
  const [anonymousLimitModal, setAnonymousLimitModal] = useState<{
    isOpen: boolean;
    limitType: "messages" | "conversations" | "time";
  }>({
    isOpen: false,
    limitType: "messages",
  });

  // Estado para controlar cuándo mostrar el botón "Ir a último mensaje"
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Configuración para streaming optimizado
  const [streamingOptimized, setStreamingOptimized] = useState(false);

  // Estado para manejo de errores
  const [error, setError] = useState<Error | string | null>(null);
  const [errorType, setErrorType] = useState<
    "error" | "warning" | "info" | "network" | "auth" | "permission"
  >("error");
  const [showErrorDashboard, setShowErrorDashboard] = useState(false);

  // Referencia para el contenedor de mensajes
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const { settings } = useSettings();
  const { sendChatNotification } = useNotifications();
  const {
    currentConversation,
    addMessage,
    updateModel,
    createNewConversation,
    loadConversation,
  } = useConversations();
  const { currentPlan, updatePlan } = usePlan();
  const { saveImage } = useImageLibrary();
  const router = useRouter();
  const { isAnonymous } = useAuth();
  const { user } = useAuth();

  // ✅ Optimización: Trackear cambios de usuario para evitar re-renderizados
  useEffect(() => {
    if (user?.uid !== currentUserIdRef.current) {
      currentUserIdRef.current = user?.uid || null;
      // Reset conversation ID cuando cambia el usuario
      currentConversationIdRef.current = null;
    }
  }, [user?.uid]);

  // Listener de scroll para mostrar/ocultar el botón "Ir a último mensaje"
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Si estamos a más de 100 píxeles del fondo, mostramos el botón
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Cargar conversación cuando cambie el conversationId
  useEffect(() => {
    if (conversationId && user?.uid) {
      loadConversation(conversationId);
    }
  }, [conversationId, user?.uid, loadConversation]);

  // Crear el prompt de personalización basado en las configuraciones - OPTIMIZADO
  const personalityPrompt = useMemo(() => {
    const personalityMap = {
      helpful: "Eres un asistente muy útil y servicial.",
      creative: "Eres un asistente creativo e imaginativo.",
      professional: "Eres un asistente profesional y formal.",
      friendly: "Eres un asistente amigable y cercano.",
      analytical: "Eres un asistente analítico y detallista.",
      casual: "Eres un asistente casual y relajado.",
    };

    const toneMap = {
      professional: "Mantén un tono profesional y respetuoso.",
      casual: "Usa un tono casual y amigable.",
      enthusiastic: "Mantén un tono entusiasta y motivador.",
      calm: "Usa un tono sereno y paciente.",
    };

    const lengthMap = {
      short: "Proporciona respuestas concisas y directas.",
      medium: "Proporciona respuestas equilibradas en longitud.",
      long: "Proporciona respuestas detalladas y completas.",
    };

    const creativityMap = {
      conservative: "Mantén respuestas más predecibles y seguras.",
      balanced: "Equilibra creatividad con precisión.",
      creative: "Sé más imaginativo y creativo en tus respuestas.",
    };

    return `${personalityMap[settings.personality]} ${toneMap[settings.tone]} ${
      lengthMap[settings.responseLength]
    } ${creativityMap[settings.creativity]}`;
  }, [
    settings.personality,
    settings.tone,
    settings.responseLength,
    settings.creativity,
  ]);

  // Preparar mensajes iniciales - OPTIMIZADO con useMemo
  const initialMessages = useMemo(() => {
    const systemMessage = {
      id: "system",
      role: "system" as const,
      content: personalityPrompt, // ✅ Usar la versión memoizada
    };

    if (
      currentConversation?.messages &&
      currentConversation.messages.length > 0
    ) {
      // Convertir mensajes de Firebase al formato de useChat
      const conversationMessages = currentConversation.messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      return [systemMessage, ...conversationMessages];
    }

    return [systemMessage];
  }, [currentConversation?.messages, personalityPrompt]); // ✅ Simplificado las dependencias

  // Función para detectar y guardar imágenes generadas por la IA
  const detectAndSaveImages = (content: string, prompt?: string) => {
    // Buscar URLs de imágenes en el contenido
    const imageUrlRegex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)/gi;
    const imageUrls = content.match(imageUrlRegex);

    if (imageUrls && imageUrls.length > 0) {
      imageUrls.forEach((imageUrl) => {
        // Guardar cada imagen encontrada
        saveImage(
          imageUrl,
          prompt || "Imagen generada por IA",
          conversationId,
          {
            model: selectedModel,
            source: "chat",
            timestamp: new Date().toISOString(),
          }
        );
      });
    }
  };

  // Memoizar las funciones de callback para useChat
  const onErrorCallback = useCallback((error: any) => {
    console.log("🔧 [DEBUG] Chat: onErrorCallback ejecutado", error);
    console.error("Error en chat:", error);

    // Manejar errores de plan
    if (
      error.message.includes("upgradeRequired") ||
      error.message.includes("Función premium")
    ) {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.upgradeRequired) {
          setPlanError({
            isOpen: true,
            currentPlan: errorData.currentPlan || "free",
            suggestedPlan: errorData.suggestedPlan || "plus",
            feature: errorData.feature || "files",
          });
          return;
        }
      } catch (e) {
        // Si no se puede parsear, continuar con el manejo normal
      }
    }
  }, []);

  const onFinishCallback = useCallback(
    async (message: any) => {
      console.log("🔧 [DEBUG] Chat: onFinishCallback ejecutado", {
        role: message.role,
        contentLength: message.content?.length,
        hasMetadata: !!(message as any).metadata,
      });
      console.log("Mensaje completado:", message);

      // Guardar mensaje en Firebase si hay una conversación activa
      if (
        currentConversation?.id &&
        message.role !== "system" &&
        message.role !== "data"
      ) {
        try {
          await addMessage(currentConversation.id, {
            role: message.role as "user" | "assistant",
            content: message.content,
          });
        } catch (error) {
          console.error("Error saving message to Firebase:", error);
        }
      }

      // Enviar notificación si está habilitada
      if (message.role === "assistant") {
        sendChatNotification(message.content.slice(0, 100) + "...");

        // Detectar y guardar imágenes generadas por la IA
        detectAndSaveImages(message.content);
      }

      // Extraer datos especializados del mensaje si están disponibles
      if (message.role === "assistant" && (message as any).metadata) {
        // Aquí se podrían procesar los datos especializados
        // como problemas matemáticos, tareas, etc.
        if ((message as any).metadata.mathProblem) {
          // Problema matemático detectado
        }

        if (
          (message as any).metadata.tasks &&
          (message as any).metadata.tasks.length > 0
        ) {
          // Tareas extraídas
        }
      }
    },
    [
      currentConversation?.id,
      addMessage,
      sendChatNotification,
      detectAndSaveImages,
    ]
  );

  const onResponseCallback = useCallback(async (response: Response) => {
    console.log("🔧 [DEBUG] Chat: onResponseCallback ejecutado", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("Content-Type"),
      hasBody: !!response.body,
    });

    // Verificar si el streaming está optimizado
    const processingTime = response.headers.get("X-Processing-Time");
    setStreamingOptimized(
      processingTime ? parseInt(processingTime) < 1000 : false
    );

    // Verificar si la respuesta es un archivo generado
    const contentType = response.headers.get("Content-Type");
    const fileType = response.headers.get("X-File-Type");
    const isFileGenerated = response.headers.get("X-File-Generated");

    if (isFileGenerated === "true" && contentType && fileType) {
      try {
        const buffer = await response.arrayBuffer();
        const filename =
          response.headers
            .get("Content-Disposition")
            ?.match(/filename="(.+)"/)?.[1] || `archivo_${Date.now()}`;

        setGeneratedFile({
          buffer,
          contentType,
          filename,
          isDownloadable: true,
        });
      } catch (error) {
        console.error("Error processing generated file:", error);
      }
    }
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages, // ✅ Usar la versión memoizada
    onError: onErrorCallback,
    onFinish: onFinishCallback,
    onResponse: onResponseCallback,
    body: {
      // Agregar datos adicionales al body de la request
      conversationId: conversationId || currentConversation?.id, // ✅ Usar conversationId de la URL primero
      userId: user?.uid,
      model: selectedModel,
    },
  });

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-scroll durante streaming - OPTIMIZADO para streaming fluido tipo máquina de escribir
  useEffect(() => {
    if (isLoading && messagesContainerRef.current) {
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      };

      // Scroll inmediato
      scrollToBottom();

      // Scroll optimizado para streaming (cada 30ms para balance entre fluidez y rendimiento)
      const interval = setInterval(scrollToBottom, 30);
      return () => clearInterval(interval);
    }
  }, [isLoading, messages.length]); // Incluir messages.length para detectar nuevos tokens

  // Actualizar modelo cuando cambie - OPTIMIZADO
  useEffect(() => {
    if (
      currentConversation?.id &&
      selectedModel !== currentConversation.model &&
      !isLoading // Solo actualizar cuando no esté cargando
    ) {
      updateModel(currentConversation.id, selectedModel).catch(console.error);
    }
  }, [
    selectedModel,
    currentConversation?.id,
    currentConversation?.model,
    isLoading,
    updateModel,
  ]);

  // Scroll automático cuando se envía un mensaje - OPTIMIZADO
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      // Hacer scroll suave hasta el final del contenedor
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]); // Removido isLoading de las dependencias

  // Cargar modelo de la conversación actual - OPTIMIZADO
  useEffect(() => {
    if (
      currentConversation?.model &&
      currentConversation.model !== selectedModel &&
      !isLoading // Solo actualizar cuando no esté cargando
    ) {
      setSelectedModel(currentConversation.model);
    }
  }, [currentConversation?.model, selectedModel, isLoading]);

  // Wrapper para manejar textarea en lugar de input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Crear un evento sintético para useChat
    const syntheticEvent = {
      target: { value: e.target.value },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  const handleNewChat = async () => {
    // Verificar límites para usuarios anónimos
    if (isAnonymous && !canCreateConversation()) {
      setAnonymousLimitModal({
        isOpen: true,
        limitType: "conversations",
      });
      return;
    }

    // Crear nueva conversación y redirigir
    try {
      // Verificar que el usuario esté autenticado antes de crear
      if (!user?.uid) {
        console.error("❌ [DEBUG] Chat: Usuario no autenticado");
        return;
      }

      const newChatId = await createNewConversation();

      // Incrementar contador para usuarios anónimos
      if (isAnonymous) {
        incrementConversationCount();
      }

      // Redirigir a la nueva conversación
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  // Guardar mensaje del usuario en Firebase con retry y fallbacks
  const handleSubmitWithFirebase = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔧 [DEBUG] Chat: handleSubmitWithFirebase iniciado", {
      input: input.substring(0, 50),
      hasConversation: !!currentConversation?.id,
      conversationId: currentConversation?.id,
    });

    // Verificar límites para usuarios anónimos
    if (isAnonymous && !canSendMessage()) {
      setAnonymousLimitModal({
        isOpen: true,
        limitType: "messages",
      });
      return;
    }

    // Verificar que hay input
    if (!input.trim()) {
      console.log("🔧 [DEBUG] Chat: Input vacío, saliendo");
      return;
    }

    // Limpiar errores previos
    setError(null);

    // Si no hay conversación activa, crear una nueva
    if (!currentConversation?.id) {
      console.log("🔧 [DEBUG] Chat: Creando nueva conversación");

      const result = await executeWithFirebaseFallback(
        async () => {
          const newChatId = await createNewConversation();
          console.log(
            "🔧 [DEBUG] Chat: Nueva conversación creada con ID:",
            newChatId
          );

          // Guardar el mensaje en la nueva conversación con retry
          await retryFirebase(
            async () =>
              addMessage(newChatId, {
                role: "user",
                content: input,
              }),
            "Save User Message"
          );

          return newChatId;
        },
        undefined, // No fallback para crear conversación
        `conversation_${user?.uid}_${Date.now()}`,
        "Create New Conversation"
      );

      if (!result.success) {
        const errorMsg = result.error?.message || "Error al crear conversación";
        setError(errorMsg);
        setErrorType("error");
        createError(
          result.error || new Error(errorMsg),
          { userId: user?.uid || "", endpoint: "createConversation" },
          "high",
          "system_error"
        );
        return;
      }

      const newChatId = result.data;

      // Enviar mensaje a la IA usando la nueva conversación con retry
      console.log(
        "🔧 [DEBUG] Chat: Enviando mensaje a la IA con nueva conversación"
      );
      const currentInput = input;
      setInput(""); // Limpiar input manualmente

      const aiResult = await executeWithAIFallback(
        async () => {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: currentInput }],
              conversationId: newChatId,
              userId: user?.uid,
              model: selectedModel,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Error al enviar mensaje a la IA: ${response.status}`
            );
          }

          return await response.json();
        },
        undefined, // No fallback para AI
        `ai_response_${newChatId}_${Date.now()}`,
        "AI Chat Response"
      );

      if (!aiResult.success) {
        const errorMsg =
          aiResult.error?.message || "Error al obtener respuesta de la IA";
        setError(errorMsg);
        setErrorType("network");
        createError(
          aiResult.error || new Error(errorMsg),
          { userId: user?.uid || "", endpoint: "ai_chat" },
          "high",
          "ai_error"
        );
        return;
      }

      const data = aiResult.data;
      console.log("🔧 [DEBUG] Chat: Respuesta de la IA recibida:", data);

      // Guardar la respuesta de la IA en Firebase con retry
      if (data.content) {
        const saveResult = await retryFirebase(
          async () =>
            addMessage(newChatId, {
              role: "assistant",
              content: data.content,
            }),
          "Save AI Response"
        );

        if (!saveResult.success) {
          console.warn(
            "⚠️ No se pudo guardar la respuesta de la IA:",
            saveResult.error
          );
          // No es crítico, continuamos
        }
      }

      // Redirigir a la nueva conversación
      router.push(`/chat/${newChatId}`);
      return;
    }

    // Guardar mensaje en Firebase con retry
    console.log("🔧 [DEBUG] Chat: Guardando mensaje en Firebase");
    const saveResult = await retryFirebase(
      async () =>
        addMessage(currentConversation.id, {
          role: "user",
          content: input,
        }),
      "Save User Message"
    );

    if (!saveResult.success) {
      const errorMsg = saveResult.error?.message || "Error al guardar mensaje";
      setError(errorMsg);
      setErrorType("error");
      createError(
        saveResult.error || new Error(errorMsg),
        {
          userId: user?.uid || "",
          endpoint: "saveMessage",
        },
        "medium",
        "system_error"
      );
      return;
    }

    console.log("🔧 [DEBUG] Chat: Mensaje guardado en Firebase exitosamente");

    // Incrementar contador para usuarios anónimos
    if (isAnonymous) {
      incrementMessageCount();
    }

    // Llamar directamente a la función de envío de useChat
    console.log("🔧 [DEBUG] Chat: Llamando a handleSubmit de useChat");
    const currentInput = input;
    setInput(""); // Limpiar input manualmente

    // Crear un nuevo evento para useChat
    const formEvent = new Event("submit") as unknown as React.FormEvent<HTMLFormElement>;
      bubbles: true,
      cancelable: true,
    }) as React.FormEvent<HTMLFormElement>;
    handleSubmit(formEvent);
  };

  // Función para manejar envío con archivos
  const handleSubmitWithFiles = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !currentConversation?.id) {
      // Si no hay conversación activa, usar el comportamiento normal
      handleSubmit(e as React.FormEvent<HTMLFormElement>);
      return;
    }

    // Guardar mensaje del usuario en Firebase
    try {
      await addMessage(currentConversation.id, {
        role: "user",
        content: input,
      });

      // Incrementar contador para usuarios anónimos
      if (isAnonymous) {
        incrementMessageCount();
      }
    } catch (error) {
      console.error("Error saving user message to Firebase:", error);
    }

    // Continuar con el envío normal
    handleSubmit(e as React.FormEvent<HTMLFormElement>);
  };

  // Funciones para las acciones de los mensajes
  const handleEditMessage = async (index: number, newContent: string) => {
    try {
      const messageToEdit = messages[index];
      if (!messageToEdit) return;

      // Actualizar el mensaje en el estado local
      const updatedMessages = [...messages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        content: newContent,
      };

      // Actualizar el estado de la conversación
      setMessages(updatedMessages);

      // Si hay una conversación activa, actualizar en Firebase
      if (currentConversation?.id) {
        // Actualizar el mensaje en Firebase
        await updateMessageInConversation(
          currentConversation.id,
          messageToEdit.id,
          newContent
        );
      }

      toast.success("Mensaje editado correctamente");
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Error al editar el mensaje");

      // Revertir cambios en caso de error
      setMessages(messages);
    }
  };

  const handleDeleteMessage = async (index: number) => {
    try {
      const messageToDelete = messages[index];
      if (!messageToDelete) return;

      // Confirmar eliminación
      if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
        return;
      }

      // Eliminar el mensaje del estado local
      const updatedMessages = messages.filter((_, i) => i !== index);
      setMessages(updatedMessages);

      // Si hay una conversación activa, eliminar de Firebase
      if (currentConversation?.id) {
        await deleteMessageFromConversation(
          currentConversation.id,
          messageToDelete.id
        );
      }

      toast.success("Mensaje eliminado correctamente");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error al eliminar el mensaje");

      // Revertir cambios en caso de error
      setMessages(messages);
    }
  };

  const handleRegenerateResponse = async (index: number) => {
    try {
      // Encontrar el mensaje del usuario anterior a la respuesta de la IA
      const userMessageIndex = index - 1;
      if (
        userMessageIndex >= 0 &&
        messages[userMessageIndex]?.role === "user"
      ) {
        const userMessage = messages[userMessageIndex];

        // Eliminar la respuesta actual y las siguientes
        const messagesToKeep = messages.slice(0, userMessageIndex + 1);
        setMessages(messagesToKeep);

        // Reenviar el mensaje del usuario para regenerar la respuesta
        const userContent = userMessage.content;

        if (userContent) {
          // Crear mensaje de carga
          const loadingMessage = {
            id: `loading-${Date.now()}`,
            role: "assistant" as const,
            content: "Regenerando respuesta...",
            createdAt: new Date(),
          };

          setMessages([...messagesToKeep, loadingMessage]);

          // Llamar a la API de chat para regenerar
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messagesToKeep.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              model: selectedModel,
              conversationId: currentConversation?.id,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al regenerar respuesta");
          }

          const data = await response.json();

          // Reemplazar mensaje de carga con la respuesta real
          const updatedMessages = messagesToKeep.map((msg) =>
            msg.id === loadingMessage.id
              ? { ...msg, content: data.content, id: data.id || msg.id }
              : msg
          );

          setMessages(updatedMessages);

          // Actualizar en Firebase si hay conversación activa
          if (currentConversation?.id && data.content) {
            await addMessage(currentConversation.id, {
              role: "assistant",
              content: data.content,
            });
          }

          toast.success("Respuesta regenerada correctamente");
        }
      }
    } catch (error) {
      console.error("Error regenerating response:", error);
      toast.error("Error al regenerar la respuesta");

      // Revertir cambios en caso de error
      setMessages(messages);
    }
  };

  const handleFeedback = async (
    index: number,
    type: "positive" | "negative"
  ) => {
    try {
      const message = messages[index];
      if (!message) return;

      // Preparar datos del feedback
      const feedbackData = {
        messageId: message.id,
        conversationId: currentConversation?.id,
        userId: user?.uid,
        type: type,
        content: message.content,
        model: selectedModel,
        timestamp: new Date(),
        metadata: {
          responseTime: 0, // Se podría calcular si se tiene el tiempo de respuesta
          tokensUsed: (message as any).metadata?.tokens?.output || 0,
          contextLength: messages.length,
        },
      };

      // Enviar feedback a Firebase
      await submitFeedback(feedbackData);

      // Mostrar confirmación visual
      const feedbackMessage =
        type === "positive"
          ? "¡Gracias por tu feedback positivo!"
          : "Gracias por tu feedback. Mejoraremos.";

      toast.success(feedbackMessage);
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Error al enviar feedback");
    }
  };

  const handleShareMessage = (index: number) => {
    const message = messages[index];
    if (message && navigator.share) {
      navigator.share({
        title: "Mensaje de Rubi",
        text: message.content,
      });
    }
  };

  const handleShareConversation = async () => {
    try {
      if (!currentConversation) {
        toast.error("No hay conversación para compartir");
        return;
      }

      // Crear contenido para compartir
      const conversationTitle =
        currentConversation.title || "Conversación con Rubi";
      const messagesText = messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => `${msg.role === "user" ? "Tú" : "Rubi"}: ${msg.content}`)
        .join("\n\n");

      const shareText = `${conversationTitle}\n\n${messagesText}\n\n---\nCompartido desde Rubi AI`;

      // Intentar usar Web Share API
      if (navigator.share) {
        await navigator.share({
          title: conversationTitle,
          text: shareText,
        });
        toast.success("Conversación compartida");
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareText);
        toast.success("Conversación copiada al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing conversation:", error);
      toast.error("Error al compartir la conversación");
    }
  };

  const handleArchiveConversation = async () => {
    try {
      if (!currentConversation?.id) {
        toast.error("No hay conversación para archivar");
        return;
      }

      // Usar la función del contexto para archivar
      await archiveConversation(currentConversation.id);
      toast.success("Conversación archivada");

      // Redirigir a nueva conversación
      router.push("/chat");
    } catch (error) {
      console.error("Error archiving conversation:", error);
      toast.error("Error al archivar la conversación");
    }
  };

  const handleReportConversation = async () => {
    try {
      if (!currentConversation?.id) {
        toast.error("No hay conversación para reportar");
        return;
      }

      // Crear reporte en Firebase
      const reportData = {
        conversationId: currentConversation.id,
        userId: user?.uid,
        reason: "Problema reportado por el usuario",
        category: "other" as const,
        details: `Conversación: ${currentConversation.title || "Sin título"}`,
      };

      // Enviar reporte a Firebase
      await submitReport(reportData);

      toast.success("Problema reportado. Gracias por tu feedback.");
    } catch (error) {
      console.error("Error reporting conversation:", error);
      toast.error("Error al reportar el problema");
    }
  };

  const handleDeleteConversation = async () => {
    try {
      if (!currentConversation?.id) {
        toast.error("No hay conversación para eliminar");
        return;
      }

      // Confirmar eliminación
      if (
        !confirm(
          "¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer."
        )
      ) {
        return;
      }

      // Usar la función del contexto para eliminar
      await deleteConversationById(currentConversation.id);
      toast.success("Conversación eliminada");

      // Redirigir a nueva conversación
      router.push("/chat");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Error al eliminar la conversación");
    }
  };

  const handleFileSelect = (file: File) => {
    console.log("Archivo seleccionado:", file.name, file.type, file.size);
    // Los archivos se manejan en ChatInput ahora
  };

  const handleUpgradePlan = (plan: UserPlan) => {
    // TODO: Implementar lógica de upgrade real (Stripe, etc.)
    console.log("Upgrading to plan:", plan);

    // Actualizar el plan en el contexto
    updatePlan(plan);

    // Cerrar el modal
    setPlanError(null);

    // Aquí iría la lógica de redirección a Stripe o actualización del plan
    // router.push(`/upgrade?plan=${plan}`);
  };

  const handleClosePlanError = () => {
    setPlanError(null);
  };

  // Memoizar los mensajes renderizados
  const renderedMessages = useMemo(
    () =>
      messages
        .filter((message) => message.role !== "system")
        .map((message, index) => (
          <ChatMessage
            key={`${message.id}-${index}-${message.role}`}
            role={message.role as "user" | "assistant"}
            content={message.content}
            timestamp={new Date().toLocaleTimeString()}
            isStreaming={isLoading && index === messages.length - 1}
            onEdit={(newContent) => handleEditMessage(index, newContent)}
            onDelete={() => handleDeleteMessage(index)}
            onRegenerate={() => handleRegenerateResponse(index)}
            onFeedback={(type) => handleFeedback(index, type)}
            onShare={() => handleShareMessage(index)}
            // Pasar datos especializados
            mathProblem={(message as any).metadata?.mathProblem}
            tasks={(message as any).metadata?.tasks}
            metadata={(message as any).metadata}
          />
        )),
    [
      messages,
      isLoading,
      handleEditMessage,
      handleDeleteMessage,
      handleRegenerateResponse,
      handleFeedback,
      handleShareMessage,
    ]
  );

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Función para hacer scroll suave al fondo
  const scrollToBottomSmooth = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Top Bar - Más minimalista y fino */}
      <div className="flex items-center justify-between pl-3 pr-1 py-1.5 bg-gray-900 relative">
        {/* Lado izquierdo - Selector de modelos en desktop, botón menú en mobile */}
        <div className="flex items-center space-x-2">
          {/* Botón menú en mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Selector de modelos - visible solo en desktop */}
          <div className="hidden md:flex items-center space-x-1.5">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>

        {/* Lado derecho - Botones de acción */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleNewChat}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            title="Nueva conversación"
          >
            <NewChatIcon className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleShareConversation}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            title="Compartir conversación"
          >
            <ShareIcon className="w-5 h-5 text-gray-400" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
              title="Más opciones"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            {isActionsMenuOpen && (
              <ActionsMenu
                isOpen={isActionsMenuOpen}
                onClose={() => setIsActionsMenuOpen(false)}
                onArchive={handleArchiveConversation}
                onReport={handleReportConversation}
                onDelete={handleDeleteConversation}
              />
            )}
          </div>
        </div>

        {/* Línea separadora perfectamente alineada con la parte inferior del header */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700"></div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 pb-20 space-y-4"
        ref={messagesContainerRef}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>¿En qué puedo ayudarte hoy?</p>
            <PlanLimitsDisplay
              currentPlan={currentPlan}
              onUpgrade={handleUpgradePlan}
            />
            <FileGenerationHelp />
          </div>
        ) : (
          renderedMessages
        )}

        {/* Mostrar archivo generado si existe */}
        {generatedFile && (
          <GeneratedFileViewer
            file={generatedFile}
            onClose={() => setGeneratedFile(null)}
          />
        )}
      </div>

      {/* Botón flotante "Ir a último mensaje" */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottomSmooth}
          className="fixed bottom-24 right-4 p-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-full shadow-lg hover:shadow-gray-500/25 transition-all duration-200 z-50 border border-gray-700"
          title="Ir al último mensaje"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Chat Input */}
      <ChatInput
        value={input}
        onChange={handleTextareaChange}
        onSubmit={handleSubmitWithFirebase}
        isLoading={isLoading}
        onFileSelect={handleFileSelect}
      />

      {/* Modal de upgrade de plan */}
      {planError && (
        <PlanUpgradeModal
          isOpen={planError.isOpen}
          onClose={handleClosePlanError}
          currentPlan={planError.currentPlan}
          suggestedPlan={planError.suggestedPlan}
          feature={planError.feature}
          onUpgrade={handleUpgradePlan}
        />
      )}

      {/* Modal de límites anónimos */}
      <AnonymousLimitModal
        isOpen={anonymousLimitModal.isOpen}
        onClose={() =>
          setAnonymousLimitModal({ isOpen: false, limitType: "messages" })
        }
        limitType={anonymousLimitModal.limitType}
      />

      {/* Notificación de errores */}
      <ErrorNotification
        error={error}
        type={errorType}
        onDismiss={() => setError(null)}
        onRetry={() => {
          // Retry logic - could be customized based on error type
          setError(null);
        }}
        autoDismiss={errorType !== "critical"}
        dismissTime={8000}
      />
    </div>
  );
});

export default Chat;

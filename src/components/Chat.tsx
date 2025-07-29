"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { MoreHorizontal, Menu } from "lucide-react";
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
import { getConversation } from "@/lib/firebase/conversations";

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
  const { user } = useAuth();

  // ✅ Optimización: Trackear cambios de usuario para evitar re-renderizados
  useEffect(() => {
    if (user?.uid !== currentUserIdRef.current) {
      currentUserIdRef.current = user?.uid || null;
      // Reset conversation ID cuando cambia el usuario
      currentConversationIdRef.current = null;
    }
  }, [user?.uid]);

  // ✅ Cargar conversación cuando cambie el conversationId
  useEffect(() => {
    if (conversationId && user?.uid) {
      console.log("🔧 [DEBUG] Chat: Cargando conversación", conversationId);
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
      conversationId: currentConversation?.id,
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

  // Auto-scroll durante streaming - OPTIMIZADO
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

      // Scroll suave durante streaming
      const interval = setInterval(scrollToBottom, 100);
      return () => clearInterval(interval);
    }
  }, [isLoading]); // Removido messages de las dependencias

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
    // Crear nueva conversación y redirigir
    try {
      // Verificar que el usuario esté autenticado antes de crear
      if (!user?.uid) {
        console.error("❌ [DEBUG] Chat: Usuario no autenticado");
        return;
      }

      const newChatId = await createNewConversation();

      // Redirigir a la nueva conversación
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  // Guardar mensaje del usuario en Firebase
  const handleSubmitWithFirebase = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔧 [DEBUG] Chat: handleSubmitWithFirebase iniciado", {
      input: input.substring(0, 50),
      hasConversation: !!currentConversation?.id,
      conversationId: currentConversation?.id,
    });

    // Verificar que hay input
    if (!input.trim()) {
      console.log("🔧 [DEBUG] Chat: Input vacío, saliendo");
      return;
    }

    // Si no hay conversación activa, crear una nueva
    if (!currentConversation?.id) {
      console.log("🔧 [DEBUG] Chat: Creando nueva conversación");
      try {
        const newChatId = await createNewConversation();
        // Redirigir a la nueva conversación
        router.push(`/chat/${newChatId}`);
        return;
      } catch (error) {
        console.error("Error creating new conversation:", error);
        return;
      }
    }

    // Guardar mensaje en Firebase
    console.log("🔧 [DEBUG] Chat: Guardando mensaje en Firebase");
    try {
      await addMessage(currentConversation.id, {
        role: "user",
        content: input,
      });
      console.log("🔧 [DEBUG] Chat: Mensaje guardado en Firebase exitosamente");
    } catch (error) {
      console.error("Error saving message:", error);
    }

    // Llamar directamente a la función de envío de useChat
    // Esto evita problemas con el evento ya procesado
    console.log("🔧 [DEBUG] Chat: Llamando a handleSubmit de useChat");
    const currentInput = input;
    setInput(""); // Limpiar input manualmente
    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
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
    } catch (error) {
      console.error("Error saving user message to Firebase:", error);
    }

    // Continuar con el envío normal
    handleSubmit(e as React.FormEvent<HTMLFormElement>);
  };

  // Funciones para las acciones de los mensajes
  const handleEditMessage = (index: number, newContent: string) => {
    // Aquí implementarías la lógica para editar el mensaje
    console.log(`Editando mensaje ${index}:`, newContent);
  };

  const handleDeleteMessage = (index: number) => {
    // Aquí implementarías la lógica para eliminar el mensaje
    console.log(`Eliminando mensaje ${index}`);
  };

  const handleRegenerateResponse = (index: number) => {
    // Aquí implementarías la lógica para regenerar la respuesta
    console.log(`Regenerando respuesta ${index}`);
  };

  const handleFeedback = (index: number, type: "positive" | "negative") => {
    // Aquí implementarías la lógica para el feedback
    console.log(`Feedback ${type} para mensaje ${index}`);
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

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Top Bar - Más minimalista y fino */}
      <div className="flex items-center justify-between pl-3 pr-1 py-1.5 bg-gray-900">
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
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            title="Compartir"
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
              />
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
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
    </div>
  );
});

export default Chat;

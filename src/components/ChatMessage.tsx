"use client";

import React, { useState } from "react";
import {
  User,
  Bot,
  Copy,
  Edit,
  Trash2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share,
  Volume2,
  VolumeX,
  Download,
  BookOpen,
} from "lucide-react";
import {
  RichMessageRenderer,
  extractSpecialBlocks,
  ExtractedBlockRenderer,
  ExtractedBlock,
} from "./RichMessageRenderer";
import MathProblemRenderer from "./MathProblemRenderer";
import TaskManager from "./TaskManager";
import { useImageLibrary } from "@/contexts/ImageLibraryContext";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: "positive" | "negative") => void;
  onShare?: () => void;
  // Nuevas props para funcionalidades especiales
  mathProblem?: any;
  tasks?: any[];
  metadata?: any;
}

export const ChatMessage = React.memo<ChatMessageProps>(
  ({
    role,
    content,
    timestamp,
    isStreaming = false,
    onEdit,
    onDelete,
    onRegenerate,
    onFeedback,
    onShare,
    mathProblem,
    tasks,
    metadata,
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const { saveImage } = useImageLibrary();
    const isUser = role === "user";

    // ✅ MODO STREAMING LIGERO: Bypass del pipeline pesado durante streaming
    if (!isUser && isStreaming) {
      return (
        <div className="bg-gray-900 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-start">
              <div className="rounded-2xl px-4 py-3 text-gray-100 shadow-lg chat-message-premium">
                <pre className="whitespace-pre-wrap text-gray-100">
                  {content}
                  <span className="inline-block w-0.5 h-5 bg-blue-400 ml-1 animate-pulse" />
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ✅ PIPELINE COMPLETO: Solo cuando no está streaming
    const { mainContent, extractedBlocks } = extractSpecialBlocks(content);

    // Detectar imágenes en el contenido
    const imageUrlRegex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)/gi;
    const imageUrls = content.match(imageUrlRegex) || [];

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        console.log("Contenido copiado al portapapeles");
      } catch (err) {
        console.error("Error al copiar:", err);
      }
    };

    const handleVoiceToggle = () => {
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        console.log("Reproduciendo audio...");
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(content);
          utterance.lang = "es-ES";
          speechSynthesis.speak(utterance);
        }
      } else {
        console.log("Deteniendo audio...");
        speechSynthesis.cancel();
      }
    };

    const handleSaveImage = async (imageUrl: string) => {
      try {
        await saveImage(imageUrl, "Imagen generada por IA", undefined, {
          source: "chat_message",
          timestamp: new Date().toISOString(),
        });
        console.log("Imagen guardada en la biblioteca");
      } catch (error) {
        console.error("Error al guardar imagen:", error);
      }
    };

    return (
      <div className="bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            {/* Burbuja principal del mensaje */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                  : "text-gray-100"
              } shadow-lg chat-message-premium`}
            >
              {isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              ) : (
                <RichMessageRenderer
                  content={
                    typeof mainContent === "string"
                      ? mainContent
                      : String(mainContent)
                  }
                  isStreaming={isStreaming}
                />
              )}
              {isStreaming && (
                <span className="inline-block w-0.5 h-5 bg-blue-400 ml-1 animate-pulse" />
              )}
            </div>

            {/* Bloques extraídos renderizados como componentes independientes */}
            {!isUser && extractedBlocks.length > 0 && (
              <div className="w-full mt-4 space-y-4">
                {extractedBlocks.map((block, index) => (
                  <div key={index} className="flex justify-start">
                    <ExtractedBlockRenderer block={block} />
                  </div>
                ))}
              </div>
            )}

            {/* Funcionalidades especiales */}
            {!isUser && (
              <>
                {/* Renderizar problema matemático */}
                {mathProblem && (
                  <div className="w-full mt-4">
                    <MathProblemRenderer problem={mathProblem} />
                  </div>
                )}

                {/* Renderizar gestor de tareas */}
                {tasks && tasks.length > 0 && (
                  <div className="w-full mt-4">
                    <TaskManager
                      tasks={tasks}
                      onTaskUpdate={(taskId, updates) => {
                        console.log("Actualizando tarea:", taskId, updates);
                        // Aquí se podría implementar la actualización real
                      }}
                      onTaskDelete={(taskId) => {
                        console.log("Eliminando tarea:", taskId);
                        // Aquí se podría implementar la eliminación real
                      }}
                    />
                  </div>
                )}

                {/* Mostrar metadata si está disponible */}
                {metadata && (
                  <div className="w-full mt-4 p-3 bg-gray-800/30 border border-gray-600 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">
                      Información adicional:
                    </div>
                    <div className="text-sm text-gray-300">
                      {metadata.contextAnalysis && (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            Tipo de contexto:
                          </span>{" "}
                          {metadata.contextAnalysis.contextType}
                        </div>
                      )}
                      {metadata.queryType && (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            Tipo de consulta:
                          </span>{" "}
                          {metadata.queryType}
                        </div>
                      )}
                      {metadata.tokens && (
                        <div className="mb-2">
                          <span className="text-gray-400">Tokens:</span>{" "}
                          {metadata.tokens.input} → {metadata.tokens.output}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Herramientas de acciones */}
            <div
              className={`flex items-center justify-end space-x-1 mt-2 pt-2 ${
                isUser ? "border-t border-gray-500" : "border-t border-gray-600"
              }`}
            >
              {isUser ? (
                // Herramientas para mensajes del usuario
                <>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-500 rounded transition-colors"
                    title="Copiar mensaje"
                  >
                    <Copy className="w-3 h-3 text-gray-200" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(content)}
                      className="p-1 hover:bg-gray-500 rounded transition-colors"
                      title="Editar mensaje"
                    >
                      <Edit className="w-3 h-3 text-gray-200" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="p-1 hover:bg-gray-500 rounded transition-colors"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-3 h-3 text-gray-200" />
                    </button>
                  )}
                </>
              ) : (
                // Herramientas para respuestas de la IA
                <>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                    title="Copiar respuesta"
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>

                  {/* Botón para guardar imágenes en la biblioteca */}
                  {imageUrls.length > 0 && imageUrls[0] && (
                    <button
                      onClick={() => handleSaveImage(imageUrls[0]!)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Guardar imagen en biblioteca"
                    >
                      <BookOpen className="w-3 h-3 text-gray-400" />
                    </button>
                  )}

                  <button
                    onClick={handleVoiceToggle}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                    title={isPlaying ? "Detener audio" : "Reproducir audio"}
                  >
                    {isPlaying ? (
                      <VolumeX className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Regenerar respuesta"
                    >
                      <RotateCcw className="w-3 h-3 text-gray-400" />
                    </button>
                  )}

                  {onFeedback && (
                    <>
                      <button
                        onClick={() => onFeedback("positive")}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Feedback positivo"
                      >
                        <ThumbsUp className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={() => onFeedback("negative")}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Feedback negativo"
                      >
                        <ThumbsDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </>
                  )}

                  {onShare && (
                    <button
                      onClick={onShare}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Compartir respuesta"
                    >
                      <Share className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </>
              )}
            </div>

            {timestamp && (
              <span className="text-xs text-gray-500 mt-1 px-2">
                {timestamp}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

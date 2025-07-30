"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Mic,
  MicOff,
  Image,
  Paperclip,
  Palette,
  X,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { useChatInputStore } from "@/lib/chatInputStore";
import { EnhancedTextarea } from "./ui/EnhancedTextarea";
import { MobileTextarea } from "./ui/MobileTextarea";
import { ToolsMenu } from "./ui/ToolsMenu";
import { FileDropzone } from "./ui/FileDropzone";
import { MobileActionsSheet } from "./ui/MobileActionsSheet";
import { useMobileUI } from "@/hooks/useIsMobile";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import CookiePreferencesModal from "./CookiePreferencesModal";
import ImageGenerationModal from "./ImageGenerationModal";
import EmojiPicker from "./EmojiPicker";
import WebSearchModal from "./WebSearchModal";
import TemplatesModal from "./TemplatesModal";
import VirtualCanvas from "./VirtualCanvas";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  onFileSelect?: (file: File) => void;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  onFileSelect,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCookieModalOpen, setIsCookieModalOpen] = React.useState(false);
  const [isMobileActionsOpen, setIsMobileActionsOpen] = React.useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = React.useState(false);
  const [isWebSearchModalOpen, setIsWebSearchModalOpen] = React.useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = React.useState(false);
  const [isCanvasModalOpen, setIsCanvasModalOpen] = React.useState(false);

  const { isMobile, isKeyboardOpen } = useMobileUI();
  const {
    isListening: isSpeechListening,
    transcript,
    isSupported: isSpeechSupported,
    startListening: startSpeechListening,
    stopListening: stopSpeechListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition();

  const {
    // Estado
    inputMode,
    isTyping,
    showToolsMenu,
    showFileUpload,
    showCanvas,
    selectedFiles,
    isListening,
    isGeneratingImage,

    // Acciones
    setValue,
    setInputMode,
    setIsTyping,
    toggleToolsMenu,
    setShowFileUpload,
    setShowCanvas,
    closeAllMenus,
    clearFiles,
    setListening,
    setGeneratingImage,
  } = useChatInputStore();

  // Sincronizar valor con el store
  useEffect(() => {
    setValue(value);
  }, [value, setValue]);

  // Detectar si está escribiendo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    if (value.length > 0) {
      setIsTyping(true);
    }

    return () => clearTimeout(timer);
  }, [value, setIsTyping]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-chat-input]")) {
        closeAllMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllMenus]);

  // Sincronizar transcript con el input
  useEffect(() => {
    if (transcript && inputMode === "voice") {
      setValue(transcript);
    }
  }, [transcript, inputMode, setValue]);

  // Mostrar error de speech si existe
  useEffect(() => {
    if (speechError) {
      console.error("Speech recognition error:", speechError);
    }
  }, [speechError]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit(e);
        clearFiles();
        setInputMode("text");
      }
    },
    [value, isLoading, onSubmit, clearFiles, setInputMode]
  );

  // Manejar selección de archivos
  const handleFileSelect = useCallback(
    (file: File) => {
      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  // Manejar micrófono
  const handleMicClick = useCallback(() => {
    if (isSpeechListening) {
      stopSpeechListening();
      setListening(false);
    } else {
      if (isSpeechSupported) {
        startSpeechListening();
        setListening(true);
        setInputMode("voice");
      } else {
        console.warn("Speech recognition not supported");
      }
    }
  }, [
    isSpeechListening,
    isSpeechSupported,
    startSpeechListening,
    stopSpeechListening,
    setListening,
    setInputMode,
  ]);

  const handleMobileAction = useCallback(
    (action: string) => {
      console.log("Mobile action triggered:", action); // Debug log
      switch (action) {
        case "image":
          setIsImageModalOpen(true);
          break;
        case "voice":
          handleMicClick();
          break;
        case "file":
          setShowFileUpload(true);
          break;
        case "web-search":
          setIsWebSearchModalOpen(true);
          break;
        case "canvas":
          setIsCanvasModalOpen(true);
          break;
        case "emoji":
          setIsEmojiModalOpen(true);
          break;
        case "templates":
          setIsTemplatesModalOpen(true);
          break;
        default:
          console.log("Unknown action:", action);
      }
    },
    [handleMicClick]
  );

  const handleEmojiSelect = (emoji: string) => {
    const currentValue = value;
    const newValue = currentValue + emoji;
    setValue(newValue);
    // Trigger onChange event
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  const handleTemplateSelect = (template: any) => {
    const currentValue = value;
    // Handle both old and new template structures
    const templateContent =
      template.content ||
      template.modes?.professional ||
      template.modes?.casual ||
      "Plantilla seleccionada";
    const newValue = currentValue + "\n\n" + templateContent;
    setValue(newValue);
    // Trigger onChange event
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  const handleWebSearchResult = (result: any) => {
    const currentValue = value;
    const newValue =
      currentValue +
      `\n\nInformación encontrada:\n${result.title}\n${result.snippet}\nFuente: ${result.url}`;
    setValue(newValue);
    // Trigger onChange event
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  const handleCanvasSave = (description: string) => {
    const currentValue = value;
    const newValue = currentValue + `\n\nHe dibujado algo: ${description}`;
    setValue(newValue);
    // Trigger onChange event
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  // Manejar generación de imagen
  const handleGenerateImage = useCallback(async () => {
    if (!value.trim()) return;

    setGeneratingImage(true);
    try {
      // TODO: Implementar generación de imagen
      console.log("Generando imagen:", value);
    } catch (error) {
      console.error("Error generando imagen:", error);
    } finally {
      setGeneratingImage(false);
    }
  }, [value, setGeneratingImage]);

  // Obtener placeholder dinámico
  const getPlaceholder = () => {
    switch (inputMode) {
      case "image":
        return "Describe la imagen que quieres generar...";
      case "voice":
        return "Presiona el micrófono para hablar...";
      case "canvas":
        return "Dibuja algo y describe lo que quieres...";
      case "file":
        return "Adjunta archivos y describe lo que necesitas...";
      default:
        return "Escribe tu mensaje...";
    }
  };

  // Obtener icono del botón principal
  const getMainButtonIcon = () => {
    if (isGeneratingImage) {
      return (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      );
    }
    if (isListening) {
      return <MicOff className="w-5 h-5" />;
    }
    return <ArrowUp className="w-5 h-5" />;
  };

  // Obtener estado del botón principal
  const getMainButtonState = () => {
    if (isGeneratingImage) return "generating";
    if (isListening) return "listening";
    if (value.trim() || selectedFiles.length > 0) return "ready";
    return "disabled";
  };

  const mainButtonState = getMainButtonState();

  // Renderizado móvil optimizado
  if (isMobile) {
    return (
      <div
        className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 p-2 pb-safe z-50"
        data-chat-input
      >
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-start space-x-2">
            {/* Botón de acciones móviles */}
            <motion.button
              type="button"
              onClick={() => setIsMobileActionsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Abrir herramientas"
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            {/* Textarea móvil */}
            <MobileTextarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              onSubmit={handleSubmit}
              inputMode={inputMode}
              isTyping={isTyping}
              isLoading={isLoading}
              maxRows={4}
              minRows={1}
            />

            {/* Botón de envío móvil */}
            <motion.button
              type="submit"
              disabled={!value.trim() || isLoading}
              whileHover={{ scale: mainButtonState === "ready" ? 1.05 : 1 }}
              whileTap={{ scale: mainButtonState === "ready" ? 0.95 : 1 }}
              className={clsx(
                "p-3 rounded-full transition-all duration-200 flex-shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                {
                  "bg-blue-500 hover:bg-blue-600 text-white":
                    mainButtonState === "ready",
                  "bg-gray-600 text-gray-400 cursor-not-allowed":
                    mainButtonState === "disabled",
                  "bg-red-500 text-white": mainButtonState === "listening",
                }
              )}
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </motion.button>
          </form>

          {/* Archivos seleccionados */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pt-2 border-t border-gray-700/50"
              >
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg text-sm"
                    >
                      <span className="text-gray-300 truncate max-w-24">
                        {file.name}
                      </span>
                      <button
                        onClick={() =>
                          useChatInputStore.getState().removeFile(index)
                        }
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="Eliminar archivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Sheet para acciones móviles */}
        <MobileActionsSheet
          isOpen={isMobileActionsOpen}
          onClose={() => setIsMobileActionsOpen(false)}
          onActionSelect={handleMobileAction}
        />

        {/* Modales */}
        <FileDropzone
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onFileSelect={handleFileSelect}
        />

        {/* Modales para móvil */}
        <ImageGenerationModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          initialPrompt={value}
        />

        <EmojiPicker
          isOpen={isEmojiModalOpen}
          onClose={() => setIsEmojiModalOpen(false)}
          onEmojiSelect={handleEmojiSelect}
        />

        <WebSearchModal
          isOpen={isWebSearchModalOpen}
          onClose={() => setIsWebSearchModalOpen(false)}
          initialQuery={value}
          onResultSelect={handleWebSearchResult}
        />

        <TemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onTemplateSelect={handleTemplateSelect}
        />

        <VirtualCanvas
          isOpen={isCanvasModalOpen}
          onClose={() => setIsCanvasModalOpen(false)}
          onSave={handleCanvasSave}
        />
      </div>
    );
  }

  // Renderizado desktop (original)
  return (
    <div className="bg-gray-900 p-4" data-chat-input>
      <div className="max-w-2xl mx-auto">
        {/* Input principal */}
        <motion.div
          className="bg-gray-800 border-none rounded-xl p-4 shadow-lg"
          initial={false}
          animate={{
            scale: isTyping ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            {/* Textarea mejorado */}
            <EnhancedTextarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              onSubmit={handleSubmit}
              inputMode={inputMode}
              isTyping={isTyping}
              isLoading={isLoading}
              placeholder={getPlaceholder()}
              className="flex-1"
            />

            {/* Botones de herramientas */}
            <div className="flex items-center space-x-2">
              {/* Menú de herramientas */}
              <ToolsMenu
                isOpen={showToolsMenu}
                onClose={closeAllMenus}
                onImageGeneration={() => setIsImageModalOpen(true)}
                onVoiceInput={handleMicClick}
                onEmojiSelect={() => setIsEmojiModalOpen(true)}
                onWebSearch={() => setIsWebSearchModalOpen(true)}
                onTemplates={() => setIsTemplatesModalOpen(true)}
              />

              {/* Botón de micrófono */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMicClick}
                disabled={isLoading || isGeneratingImage}
                className={clsx(
                  "p-2 rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "border-0",
                  {
                    "bg-red-500/20 text-red-400": isListening,
                    "text-gray-400 hover:text-white hover:bg-gray-700/50":
                      !isListening,
                    "opacity-50 cursor-not-allowed":
                      isLoading || isGeneratingImage,
                  }
                )}
                aria-label={
                  isListening ? "Detener grabación" : "Iniciar grabación"
                }
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>

              {/* Botón de archivos */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFileUpload(true)}
                disabled={isLoading || isGeneratingImage}
                className={clsx(
                  "p-2 rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "text-gray-400 hover:text-white hover:bg-gray-700/50",
                  "border-0",
                  {
                    "opacity-50 cursor-not-allowed":
                      isLoading || isGeneratingImage,
                  }
                )}
                aria-label="Subir archivos"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>

              {/* Botón principal */}
              <motion.button
                type="submit"
                whileHover={{ scale: mainButtonState === "ready" ? 1.05 : 1 }}
                whileTap={{ scale: mainButtonState === "ready" ? 0.95 : 1 }}
                disabled={mainButtonState === "disabled" || isLoading}
                className={clsx(
                  "p-2 rounded-full transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "border-2",
                  {
                    "bg-white hover:bg-gray-100 text-gray-900 border-white hover:border-gray-100":
                      mainButtonState === "ready",
                    "bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600":
                      mainButtonState === "disabled",
                    "bg-blue-500 text-white border-blue-500":
                      mainButtonState === "generating",
                    "bg-red-500 text-white border-red-500":
                      mainButtonState === "listening",
                  }
                )}
                aria-label="Enviar mensaje"
              >
                {getMainButtonIcon()}
              </motion.button>
            </div>
          </form>

          {/* Archivos seleccionados */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-700/50"
              >
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg text-sm"
                    >
                      <span className="text-gray-300 truncate max-w-32">
                        {file.name}
                      </span>
                      <button
                        onClick={() =>
                          useChatInputStore.getState().removeFile(index)
                        }
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="Eliminar archivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Texto de ayuda */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span>
          Rubi puede cometer errores. Considera verificar la información
          importante.{" "}
        </span>
        <button
          onClick={() => setIsCookieModalOpen(true)}
          className="underline hover:text-gray-400 transition-colors"
        >
          Ver preferencias de cookies
        </button>
      </div>

      {/* Modales */}
      <CookiePreferencesModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />

      <FileDropzone
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileSelect}
      />

      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        initialPrompt={value}
      />

      <EmojiPicker
        isOpen={isEmojiModalOpen}
        onClose={() => setIsEmojiModalOpen(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      <WebSearchModal
        isOpen={isWebSearchModalOpen}
        onClose={() => setIsWebSearchModalOpen(false)}
        initialQuery={value}
        onResultSelect={handleWebSearchResult}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />

      <VirtualCanvas
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
        onSave={handleCanvasSave}
      />
    </div>
  );
}

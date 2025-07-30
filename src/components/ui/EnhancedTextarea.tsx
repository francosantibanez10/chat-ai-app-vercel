"use client";

import React, { forwardRef, useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import { InputMode } from "@/lib/chatInputStore";
import clsx from "clsx";

interface EnhancedTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputMode: InputMode;
  isTyping: boolean;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  maxRows?: number;
  minRows?: number;
}

const getPlaceholder = (mode: InputMode): string => {
  switch (mode) {
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

export const EnhancedTextarea = forwardRef<
  HTMLTextAreaElement,
  EnhancedTextareaProps
>(
  (
    {
      value,
      onChange,
      onSubmit,
      inputMode,
      isTyping,
      isLoading = false,
      className,
      maxRows = 6,
      minRows = 1,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (value.trim() && !isLoading) {
            onSubmit(e as any);
          }
        }

        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "i":
              e.preventDefault();
              // TODO: Abrir menú de imágenes
              break;
            case "m":
              e.preventDefault();
              // TODO: Activar micrófono
              break;
            case "k":
              e.preventDefault();
              // TODO: Abrir búsqueda
              break;
          }
        }
      },
      [value, isLoading, onSubmit]
    );

    const placeholder = getPlaceholder(inputMode);

    return (
      <motion.div
        className={clsx("relative flex-1", className)}
        initial={false}
        animate={{
          scale: isTyping ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <TextareaAutosize
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          maxRows={maxRows}
          minRows={minRows}
          className={clsx(
            "w-full resize-none bg-transparent text-white placeholder-gray-400",
            "outline-none border-0 focus:outline-none focus:ring-0 focus:border-0",
            "text-sm leading-relaxed",
            "transition-all duration-200",
            "scrollbar-hide",
            {
              "opacity-50 cursor-not-allowed": isLoading,
              "focus:placeholder-gray-500": !isLoading,
            }
          )}
          style={{
            fontFamily: "inherit",
            lineHeight: "1.6",
          }}
          aria-label="Campo de texto para escribir mensajes"
          aria-describedby="input-help"
          {...props}
        />

        {/* Indicador de estado */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          />
        )}

        {/* Texto de ayuda para accesibilidad */}
        <div id="input-help" className="sr-only">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </div>
      </motion.div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

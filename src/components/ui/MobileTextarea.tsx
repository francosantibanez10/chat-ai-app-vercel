"use client";

import React, { forwardRef, useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import { InputMode } from "@/lib/chatInputStore";
import clsx from "clsx";

interface MobileTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputMode: InputMode;
  isTyping: boolean;
  isLoading?: boolean;
  className?: string;
  maxRows?: number;
  minRows?: number;
  placeholder?: string;
}

const getPlaceholder = (mode: InputMode): string => {
  switch (mode) {
    case "image":
      return "Describe la imagen que quieres generar...";
    case "voice":
      return "Presiona para grabar tu mensaje...";
    case "file":
      return "Adjunta archivos y describe qué necesitas...";
    case "search":
      return "¿Sobre qué tema quieres buscar información?";
    case "canvas":
      return "Describe lo que quieres crear en el lienzo...";
    default:
      return "Escribe tu mensaje...";
  }
};

export const MobileTextarea = forwardRef<
  HTMLTextAreaElement,
  MobileTextareaProps
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
      maxRows = 4,
      minRows = 2, // Aumentado para asegurar altura mínima de ~44px
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    // Detectar si hay contenido
    useEffect(() => {
      setHasContent(value.trim().length > 0);
    }, [value]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (value.trim() && !isLoading) {
            onSubmit(e as any);
          }
        }
      },
      [value, isLoading, onSubmit]
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Scroll automático en iOS
      setTimeout(() => {
        if (ref && "current" in ref && ref.current) {
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }, [ref]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const dynamicPlaceholder = placeholder || getPlaceholder(inputMode);

    return (
      <motion.div
        className={clsx("relative flex-1", className)}
        initial={false}
        animate={{
          scale: isTyping ? 1.01 : 1,
          borderColor: isFocused ? "#3B82F6" : "#374151",
        }}
        transition={{ duration: 0.2 }}
      >
        <TextareaAutosize
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={dynamicPlaceholder}
          disabled={isLoading}
          maxRows={maxRows}
          minRows={minRows}
          className={clsx(
            "w-full resize-none bg-gray-800 border-0 rounded-xl",
            "text-white placeholder-gray-400 text-base leading-relaxed",
            "outline-none focus:outline-none focus:ring-0 focus:border-0",
            "transition-all duration-200 px-4 py-3",
            "scrollbar-hide",
            "min-h-[44px]", // Touch target mínimo usando Tailwind
            {
              "opacity-50 cursor-not-allowed": isLoading,
              "bg-gray-700": isFocused,
            }
          )}
          style={{
            fontFamily: "inherit",
            lineHeight: "1.5",
          }}
          aria-label="Campo de texto para escribir mensajes"
          aria-describedby="mobile-input-help"
          {...props}
        />

        {/* Indicador de escritura */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          />
        )}

        {/* Indicador de contenido */}
        {hasContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-1 left-4 text-xs text-gray-500"
          >
            {value.length} caracteres
          </motion.div>
        )}

        {/* Ayuda para lectores de pantalla */}
        <div id="mobile-input-help" className="sr-only">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </div>
      </motion.div>
    );
  }
);

MobileTextarea.displayName = "MobileTextarea";

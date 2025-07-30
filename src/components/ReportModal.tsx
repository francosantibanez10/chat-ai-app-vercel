"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, AlertTriangle } from "lucide-react";
import { submitReport } from "@/lib/reports";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  conversationTitle?: string;
  userId?: string;
}

const reportCategories = [
  { id: "inappropriate", label: "Contenido inapropiado", description: "Contenido ofensivo o inadecuado" },
  { id: "spam", label: "Spam", description: "Contenido no deseado o repetitivo" },
  { id: "error", label: "Error técnico", description: "Problemas con la funcionalidad" },
  { id: "other", label: "Otro", description: "Otro tipo de problema" },
];

export default function ReportModal({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
  userId,
}: ReportModalProps) {
  const [category, setCategory] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.trim()) {
      alert("Por favor selecciona una categoría");
      return;
    }

    if (!conversationId) {
      alert("No hay conversación para reportar");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReport({
        conversationId,
        userId,
        reason: `Reporte: ${category}`,
        category: category as any,
        details: details.trim() || "Sin detalles adicionales",
      });

      // Reset form
      setCategory("");
      setDetails("");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error al enviar el reporte. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[75]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Flag className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">
                  Reportar problema
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {conversationTitle && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Conversación:</p>
                  <p className="text-white font-medium">{conversationTitle}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría del problema *
                  </label>
                  <div className="space-y-2">
                    {reportCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-start space-x-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={category === cat.id}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-1 text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-white font-medium">{cat.label}</div>
                          <div className="text-sm text-gray-400">{cat.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detalles adicionales (opcional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe el problema con más detalle..."
                    className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {details.length}/500 caracteres
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Tu reporte será revisado por nuestro equipo</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !category.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
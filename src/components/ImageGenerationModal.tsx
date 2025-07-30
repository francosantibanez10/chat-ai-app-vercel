"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image,
  Sparkles,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  generateImage,
  validateImagePrompt,
  getImageGenerationSuggestions,
} from "@/lib/imageGeneration";
import { useImageLibrary } from "@/contexts/ImageLibraryContext";
import { toast } from "react-hot-toast";

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function ImageGenerationModal({
  isOpen,
  onClose,
  initialPrompt = "",
}: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [size, setSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">(
    "1024x1024"
  );
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [style, setStyle] = useState<"vivid" | "natural">("vivid");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveImage } = useImageLibrary();
  const suggestions = getImageGenerationSuggestions();

  const handleGenerate = async () => {
    // Validar prompt
    const validation = validateImagePrompt(prompt);
    if (!validation.isValid) {
      setError(validation.error || "Prompt inválido");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImage({
        prompt,
        size,
        quality,
        style,
        model: "dall-e-3",
      });

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setGeneratedImage(result.url);
        toast.success("Imagen generada exitosamente");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al generar imagen";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedImage) return;

    try {
      await saveImage(generatedImage, prompt, undefined, {
        source: "image_generation",
        prompt,
        size,
        quality,
        style,
        timestamp: new Date().toISOString(),
      });
      toast.success("Imagen guardada en la biblioteca");
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Error al guardar la imagen");
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rubi-ai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Imagen descargada");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error al descargar la imagen");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
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
            className="fixed top-4 left-4 right-4 bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 md:max-w-6xl md:max-h-[85vh] md:mx-auto md:my-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Image className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">
                  Generar Imagen con IA
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-[600px] md:h-[70vh]">
              {/* Panel izquierdo - Configuración */}
              <div className="w-full md:w-1/2 p-6 border-r border-gray-800 overflow-y-auto">
                <div className="space-y-6">
                  {/* Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe la imagen que quieres crear *
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Un gato espacial explorando una galaxia colorida..."
                      className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {prompt.length}/1000 caracteres
                    </div>
                    {error && (
                      <div className="text-red-400 text-sm mt-2">{error}</div>
                    )}
                  </div>

                  {/* Configuración avanzada */}
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración avanzada</span>
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-4"
                        >
                          {/* Tamaño */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tamaño
                            </label>
                            <select
                              value={size}
                              onChange={(e) => setSize(e.target.value as any)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="1024x1024">
                                Cuadrado (1024x1024)
                              </option>
                              <option value="1792x1024">
                                Paisaje (1792x1024)
                              </option>
                              <option value="1024x1792">
                                Retrato (1024x1792)
                              </option>
                            </select>
                          </div>

                          {/* Calidad */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Calidad
                            </label>
                            <select
                              value={quality}
                              onChange={(e) =>
                                setQuality(e.target.value as any)
                              }
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="standard">Estándar</option>
                              <option value="hd">Alta definición</option>
                            </select>
                          </div>

                          {/* Estilo */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Estilo
                            </label>
                            <select
                              value={style}
                              onChange={(e) => setStyle(e.target.value as any)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="vivid">Vívido</option>
                              <option value="natural">Natural</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sugerencias */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sugerencias
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.slice(0, 5).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botón generar */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generar Imagen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Panel derecho - Resultado */}
              <div className="w-full md:w-1/2 p-6 bg-gray-800/50 flex flex-col">
                <h3 className="text-lg font-medium text-white mb-4">
                  Resultado
                </h3>

                <div className="flex-1 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-400">Generando tu imagen...</p>
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full space-y-4">
                      <div className="relative">
                        <img
                          src={generatedImage}
                          alt={prompt}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveToLibrary}
                          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Image className="w-4 h-4" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Escribe un prompt y genera tu imagen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

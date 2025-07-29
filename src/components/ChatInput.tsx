"use client";

import {
  Plus,
  Mic,
  ArrowUp,
  ChevronDown,
  Search,
  Globe,
  Image,
  PencilRuler,
  Download,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import WaveformIcon from "./WaveformIcon";
import ToolsIcon from "./ToolsIcon";
import PlusMenu from "./PlusMenu";
import CookiePreferencesModal from "./CookiePreferencesModal";
import FileUpload from "./FileUpload";
import FilePreview from "./FilePreview";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { ReactSketchCanvas } from "react-sketch-canvas";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  onFileSelect?: (file: File) => void;
}

// Definir las herramientas avanzadas disponibles
const ADVANCED_TOOLS = [
  {
    id: "research",
    display: "Investigación profunda",
    icon: Search,
    color: "text-indigo-400",
    description: "Análisis exhaustivo con modelos avanzados",
  },
  {
    id: "web",
    display: "Búsqueda web",
    icon: Globe,
    color: "text-blue-400",
    description: "Información actualizada de internet",
  },
  {
    id: "image",
    display: "Crear imagen",
    icon: Image,
    color: "text-pink-400",
    description: "Generar imágenes con IA",
  },
];

// Definir estilos de imagen predefinidos
const IMAGE_STYLES = [
  {
    id: "cyberpunk",
    name: "Ciberpunk",
    description: "Estilo futurista con neones y tecnología",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/cyberpunk.webp",
    prompt:
      "Crea una imagen con estética cyberpunk: estilo futurista distópico con neones brillantes, tecnología avanzada, edificios altos con luces de neón, atmósfera urbana nocturna, colores vibrantes en azul, rosa y púrpura, elementos tecnológicos y una sensación de futuro oscuro pero vibrante.",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Estilo de animación japonesa",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/anime.webp",
    prompt:
      "Crea una imagen con estilo anime: ilustración en el estilo de animación japonesa, colores vibrantes y saturados, ojos grandes y expresivos, cabello detallado y estilizado, líneas limpias y definidas, fondos coloridos y expresivos, con una estética manga/anime característica.",
  },
  {
    id: "dramatic",
    name: "Retrato dramático",
    description: "Retrato realista con sombras dramáticas",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/dramatic-headshot.webp",
    prompt:
      "Crea una imagen con estilo de retrato dramático: fotografía realista con iluminación cinematográfica, sombras profundas y contrastes marcados, iluminación lateral o desde arriba, atmósfera intensa y emocional, calidad profesional de estudio fotográfico, enfoque en la expresión y las emociones.",
  },
  {
    id: "coloring",
    name: "Libro para colorear",
    description: "Ilustración simple en blanco y negro",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/coloring-book.webp",
    prompt:
      "Crea una imagen con estilo de libro para colorear: ilustración simple en blanco y negro, líneas limpias y definidas, sin sombreado complejo, diseño minimalista y claro, perfecto para colorear, con contornos bien marcados y espacios abiertos para el color.",
  },
  {
    id: "photoshoot",
    name: "Sesión de fotos",
    description: "Fotografía profesional con iluminación suave",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/photo-shoot.webp",
    prompt:
      "Crea una imagen con estilo de sesión de fotos profesional: fotografía de alta calidad con iluminación suave y natural, fondo limpio y minimalista, composición elegante y profesional, colores naturales y balanceados, enfoque nítido y detallado, estilo editorial o de revista.",
  },
  {
    id: "retro",
    name: "Dibujos animados retro",
    description: "Estilo vintage de dibujos animados",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/retro-cartoon.webp",
    prompt:
      "Crea una imagen con estilo de dibujos animados retro: ilustración vintage inspirada en los años 50-80, colores pasteles y vibrantes, líneas suaves y redondeadas, estética nostálgica y clásica, elementos de la cultura pop retro, con un toque de inocencia y simplicidad característica de la época.",
  },
  {
    id: "80s-glam",
    name: "80s Glam",
    description: "Estilo glamoroso de los años 80",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/80s-glam.webp",
    prompt:
      "Crea una imagen con estilo 80s Glam: estética glamorosa de los años 80 con colores vibrantes, brillos y destellos, cabello voluminoso y estilizado, maquillaje dramático, ropa llamativa y brillante, atmósfera de fiesta y diversión, con elementos característicos de la moda y cultura de los años 80.",
  },
  {
    id: "art-nouveau",
    name: "Art Nouveau",
    description: "Estilo artístico de finales del siglo XIX",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/art-nouveau.webp",
    prompt:
      "Crea una imagen con estilo Art Nouveau: diseño artístico de finales del siglo XIX con líneas orgánicas y fluidas, motivos florales y naturales, colores suaves y elegantes, elementos decorativos intrincados, composición asimétrica y elegante, con influencias de la naturaleza y el arte ornamental.",
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description: "Estilo retrofuturista de los años 80",
    imageUrl:
      "https://cdn.openai.com/API/images/image-picker-styles/v2/synthwave.webp",
    prompt:
      "Crea una imagen con una estética synthwave: estilo retrofuturista de los años 80 con rejillas de neón, atardecer brillante, degradados vibrantes en magenta y cian, reflejos cromados y una atmósfera nostálgica futurista.",
  },
];

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  onFileSelect,
}: ChatInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [canvasRef, setCanvasRef] = useState<any>(null);
  const [inputMode, setInputMode] = useState<string | null>(null);
  const [selectedImageStyle, setSelectedImageStyle] = useState<string | null>(
    null
  );
  const [showStylesMenu, setShowStylesMenu] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Cerrar menú de herramientas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setIsToolsMenuOpen(false);
      }
    };

    if (isToolsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isToolsMenuOpen]);

  // Cerrar menú de estilos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".styles-menu-container")) {
        setShowStylesMenu(false);
      }
    };

    if (showStylesMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStylesMenu]);

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    setIsToolsMenuOpen(false);

    switch (toolId) {
      case "research":
        // Activar modo de investigación profunda
        setInputMode("research");
        break;

      case "web":
        // Activar modo de búsqueda web
        setInputMode("web");
        break;

      case "image":
        // Activar modo de generación de imágenes
        setInputMode("image");
        break;

      case "canvas":
        // Abrir lienzo virtual
        setShowCanvas(true);
        break;
    }

    // Enfocar el input después de seleccionar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Por favor, describe la imagen que quieres crear");
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Combinar el prompt del usuario con el estilo seleccionado
      let finalPrompt = imagePrompt;
      if (selectedImageStyle) {
        const style = IMAGE_STYLES.find((s) => s.id === selectedImageStyle);
        if (style) {
          finalPrompt = `${imagePrompt}, ${style.prompt}`;
        }
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar la imagen");
      }

      const data = await response.json();

      // Enviar la imagen generada al chat
      const styleText = selectedImageStyle
        ? ` (Estilo: ${
            IMAGE_STYLES.find((s) => s.id === selectedImageStyle)?.name
          })`
        : "";
      const imageMessage = `🎨 **Imagen Generada:** ${finalPrompt}${styleText}\n\n![Imagen generada](${data.imageUrl})`;
      const syntheticEvent = {
        target: { value: imageMessage },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);

      setShowImageGenerator(false);
      setImagePrompt("");
      setSelectedImageStyle(null);
      toast.success("¡Imagen generada exitosamente!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error al generar la imagen. Inténtalo de nuevo.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveCanvas = async () => {
    if (!canvasRef) return;

    try {
      const dataUrl = await canvasRef.exportImage("png");

      // Convertir data URL a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Crear archivo
      const file = new File([blob], "canvas-drawing.png", {
        type: "image/png",
      });

      // Enviar al chat como archivo
      const canvasMessage = `🎨 **Dibujo del Lienzo**\n\nHe creado un dibujo en el lienzo virtual.`;
      const syntheticEvent = {
        target: { value: canvasMessage },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);

      // Agregar el archivo a los archivos seleccionados
      setSelectedFiles((prev) => [...prev, file]);

      setShowCanvas(false);
      toast.success("¡Dibujo guardado exitosamente!");
    } catch (error) {
      console.error("Error saving canvas:", error);
      toast.error("Error al guardar el dibujo");
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef) {
      canvasRef.clearCanvas();
      toast.success("Lienzo limpiado");
    }
  };

  const clearInputMode = () => {
    setInputMode(null);
    setSelectedImageStyle(null);
    setShowStylesMenu(false);
  };

  const getModeDisplay = () => {
    switch (inputMode) {
      case "research":
        return { text: "Investiga", icon: Search, color: "text-indigo-400" };
      case "web":
        return { text: "Fuentes", icon: Globe, color: "text-blue-400" };
      case "image":
        return { text: "Imagen", icon: Image, color: "text-pink-400" };
      default:
        return null;
    }
  };

  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("El reconocimiento de voz no está disponible en este navegador");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "es-ES";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const syntheticEvent = {
        target: { value: value + transcript },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Quitar el foco del input cuando está cargando
  useEffect(() => {
    if (isLoading && inputRef.current) {
      inputRef.current.blur();
    }
  }, [isLoading]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFiles((prev) => [...prev, file]);
    setShowFileUpload(false);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitWithFiles = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (value.trim() || selectedFiles.length > 0) {
        setIsUploading(true);

        try {
          console.log(
            "Enviando mensaje con archivos:",
            value.trim(),
            selectedFiles.length
          );

          // Agregar el modo activo al mensaje si existe
          let finalMessage = value;
          if (inputMode === "research") {
            finalMessage = `🔍 **MODO INVESTIGACIÓN PROFUNDA ACTIVADO**\n\n${value}`;
          } else if (inputMode === "web") {
            finalMessage = `🌐 **MODO BÚSQUEDA WEB ACTIVADO**\n\n${value}`;
          } else if (inputMode === "image") {
            finalMessage = `🎨 **MODO GENERACIÓN DE IMAGENES ACTIVADO**\n\n${value}`;
          }

          // Si hay archivos, usar FormData
          if (selectedFiles.length > 0) {
            // Crear FormData para enviar archivos
            const formData = new FormData();

            // Agregar mensajes como JSON string
            const messages = [
              {
                role: "user",
                content: finalMessage.trim() || "Analiza estos archivos",
              },
            ];
            formData.append("messages", JSON.stringify(messages));

            // Agregar archivos
            selectedFiles.forEach((file) => {
              formData.append("files", file);
            });

            // Llamar a la API con FormData
            const response = await fetch("/api/chat", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Error al enviar mensaje");
            }

            // Limpiar archivos seleccionados
            setSelectedFiles([]);

            // Llamar al onSubmit original para manejar la respuesta
            onSubmit(e);
          } else {
            // Si no hay archivos, usar el flujo normal
            // Actualizar el valor del input con el mensaje final
            const syntheticEvent = {
              target: { value: finalMessage },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);

            // Llamar al onSubmit
            onSubmit(e);

            // Si es modo imagen, manejar la respuesta especial
            if (inputMode === "image") {
              try {
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messages: [{ role: "user", content: finalMessage }],
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  if (data.type === "image_generation") {
                    // Enviar la imagen generada al chat
                    const styleText = selectedImageStyle
                      ? ` (Estilo: ${
                          IMAGE_STYLES.find((s) => s.id === selectedImageStyle)
                            ?.name
                        })`
                      : "";
                    const imageMessage = `🎨 **Imagen Generada:** ${finalMessage.replace(
                      /🎨 \*\*MODO GENERACIÓN DE IMAGENES ACTIVADO\*\*\n\n/,
                      ""
                    )}${styleText}\n\n![Imagen generada](${data.imageUrl})`;
                    const imageEvent = {
                      target: { value: imageMessage },
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    onChange(imageEvent);

                    // Enviar el mensaje con la imagen
                    const submitEvent = new Event("submit", { bubbles: true });
                    onSubmit(submitEvent as any);
                  }
                }
              } catch (error) {
                console.error("Error handling image generation:", error);
              }
            }
          }

          // Limpiar el modo activo después de enviar
          setInputMode(null);
        } catch (error) {
          console.error("Error al enviar mensaje:", error);
          toast.error("Error al enviar mensaje");
        } finally {
          setIsUploading(false);
        }
      }
    },
    [value, selectedFiles, onSubmit, inputMode, onChange]
  );

  return (
    <div className="bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Preview de archivos seleccionados */}
        <FilePreview files={selectedFiles} onRemoveFile={handleRemoveFile} />

        <form onSubmit={handleSubmitWithFiles} className="relative">
          <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-2xl transition-colors">
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
              <PlusMenu
                isOpen={isPlusMenuOpen}
                onClose={() => setIsPlusMenuOpen(false)}
                onFileSelect={handleFileSelect}
                onOpenFileUpload={() => setShowFileUpload(true)}
              />
            </div>

            {/* Modo activo */}
            {inputMode &&
              (() => {
                const modeInfo = getModeDisplay();
                if (!modeInfo) return null;
                const IconComponent = modeInfo.icon;
                return (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 rounded-3xl text-sm flex-shrink-0">
                      <IconComponent className={`w-4 h-4 ${modeInfo.color}`} />
                      <span className={modeInfo.color}>{modeInfo.text}</span>
                      <button
                        onClick={clearInputMode}
                        className="ml-1 hover:bg-blue-500/20 rounded p-0.5 transition-colors"
                      >
                        <span className={`text-xs ${modeInfo.color}`}>✕</span>
                      </button>
                    </div>

                    {/* Botón de estilos solo para modo imagen */}
                    {inputMode === "image" && (
                      <div className="relative styles-menu-container">
                        <button
                          onClick={() => setShowStylesMenu(!showStylesMenu)}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-3xl text-sm text-gray-300 transition-colors flex-shrink-0"
                        >
                          <span>Estilos</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              showStylesMenu ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showStylesMenu && (
                          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg overflow-hidden z-50 w-[345px] p-3">
                            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                              {IMAGE_STYLES.map((style) => (
                                <button
                                  key={style.id}
                                  onClick={() => {
                                    // Enviar el prompt del estilo al input
                                    const syntheticEvent = {
                                      target: { value: style.prompt },
                                    } as React.ChangeEvent<HTMLTextAreaElement>;
                                    onChange(syntheticEvent);
                                    setShowStylesMenu(false);
                                  }}
                                  className="hover:bg-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 flex flex-col items-center gap-2.5 rounded-md p-1 text-xs focus-visible:outline-none transition-colors"
                                >
                                  <img
                                    alt={style.name}
                                    className="aspect-square w-4/5 rounded-full object-cover"
                                    src={style.imageUrl}
                                  />
                                  <span className="text-gray-300 text-center">
                                    {style.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Botón de herramientas */}
            <div className="relative flex-shrink-0" ref={toolsMenuRef}>
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <ToolsIcon className="w-4 h-4 text-gray-400" />
              </button>

              {/* Menú desplegable de herramientas */}
              {isToolsMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-[280px]">
                  <div className="py-2">
                    {ADVANCED_TOOLS.map((tool, index) => {
                      const IconComponent = tool.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleToolSelect(tool.id)}
                          className="w-full flex items-start space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                        >
                          <IconComponent
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tool.color}`}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {tool.display}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {tool.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <textarea
              ref={inputRef}
              name="message"
              value={value}
              onChange={onChange}
              placeholder="Pregunta lo que quieras"
              className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 outline-none text-base min-w-0 resize-none overflow-y-auto border-none focus:border-none focus:outline-none scrollbar-hide"
              disabled={isLoading}
              rows={1}
              style={{
                minHeight: "24px",
                maxHeight: "200px",
                height: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 200) + "px";
              }}
              onKeyDown={(e) => {
                // Enviar mensaje al presionar Enter (sin Shift para nueva línea)
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (value.trim() || selectedFiles.length > 0) {
                    handleSubmitWithFiles(e as any);
                  }
                }
              }}
            />

            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-1 rounded transition-colors ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700"
                    : "hover:bg-gray-800"
                }`}
                title={isListening ? "Detener grabación" : "Grabar voz"}
              >
                <Mic
                  className={`w-5 h-5 ${
                    isListening ? "text-white" : "text-gray-400"
                  }`}
                />
              </button>
              {isListening && (
                <div className="flex items-center space-x-1 text-xs text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Escuchando...</span>
                </div>
              )}

              <button
                type="button"
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <WaveformIcon className="w-5 h-5 text-gray-400" />
              </button>

              {(value.trim() || selectedFiles.length > 0) && (
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="p-1 bg-white hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-gray-900" />
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-2 text-xs text-gray-500 text-center">
          <span>
            Rubi puede cometer errores. Considera verificar la información
            importante.{" "}
          </span>
          <button
            onClick={() => setIsCookieModalOpen(true)}
            className="underline hover:text-gray-400"
          >
            Ver preferencias de cookies
          </button>
        </div>

        <CookiePreferencesModal
          isOpen={isCookieModalOpen}
          onClose={() => setIsCookieModalOpen(false)}
        />

        {/* Modal de subida de archivos */}
        {showFileUpload && (
          <FileUpload
            onFileSelect={handleFileSelect}
            onClose={() => setShowFileUpload(false)}
          />
        )}

        {/* Modal de lienzo virtual */}
        {showCanvas && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-[800px] max-w-[90vw] h-[600px] max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  🎨 Lienzo Virtual
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearCanvas}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Limpiar lienzo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveCanvas}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Guardar dibujo"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCanvas(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg h-full overflow-hidden">
                <ReactSketchCanvas
                  ref={(ref) => setCanvasRef(ref)}
                  strokeColor="black"
                  strokeWidth={2}
                  width="100%"
                  height="100%"
                  style={{
                    border: "none",
                    borderRadius: "0.5rem",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

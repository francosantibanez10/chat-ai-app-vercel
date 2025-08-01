"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Model {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
}

const models: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description:
      "Rápido, multimodal y avanzado. Conversación natural, análisis, comprensión de imágenes, documentos, tablas, voz y más.",
    shortDescription: "Todo en uno, texto, voz, imágenes",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description:
      "Respuestas avanzadas, contexto largo. Análisis profundo, largos contextos, más barato y rápido que GPT-4 clásico.",
    shortDescription: "Texto largo, análisis profundo, rápido",
  },
  {
    id: "gpt-4",
    name: "GPT-4 (Legacy)",
    description:
      "Alta precisión, más detallista. Soluciones precisas, textos complejos, razonamiento avanzado.",
    shortDescription: "Precisión máxima, investigación",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description:
      "Ultra rápido, eficiente, económico. Conversación básica, tareas generales, consumo bajo de tokens.",
    shortDescription: "Ultra rápido, eficiente, económico",
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel =
    models.find((model) => model.id === selectedModel) || models[3]; // Default to GPT-3.5

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    console.log('🖱️ ModelSelector clicked, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('🔄 New isOpen state:', !isOpen);
  };

  console.log('🎯 ModelSelector render - isOpen:', isOpen);

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      style={{ position: "relative", zIndex: 50 }}
    >
      <button
        onClick={handleToggle}
        className="flex items-center space-x-1.5 p-1.5 hover:bg-gray-800 rounded-md transition-colors"
      >
        <span className="text-sm font-medium text-white">
          {currentModel.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "4px",
            width: "320px",
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
            visibility: "visible",
            opacity: 1,
            display: "block",
          }}
        >
          <div className="p-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedModel === model.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                style={{
                  visibility: "visible",
                  opacity: 1,
                  display: "block",
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{model.name}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {model.shortDescription}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

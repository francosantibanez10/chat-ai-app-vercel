"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RotateCcw,
  Download,
  Palette,
  Brush,
  Eraser,
  Square,
  Circle,
  Type,
} from "lucide-react";

interface VirtualCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
}

type Tool = "brush" | "eraser" | "square" | "circle" | "text";

export default function VirtualCanvas({
  isOpen,
  onClose,
  onSave,
}: VirtualCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(5);
  const [color, setColor] = useState("#ffffff");
  const [description, setDescription] = useState("");

  const tools = [
    { id: "brush", icon: Brush, label: "Pincel" },
    { id: "eraser", icon: Eraser, label: "Borrador" },
    { id: "square", icon: Square, label: "Rectángulo" },
    { id: "circle", icon: Circle, label: "Círculo" },
    { id: "text", icon: Type, label: "Texto" },
  ];

  const colors = [
    "#ffffff",
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fondo negro
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = currentTool === "eraser" ? "#000000" : color;
      ctx.lineWidth = brushSize;
    },
    [currentTool, color, brushSize]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const downloadCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "rubi-canvas.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const handleSave = useCallback(() => {
    onSave(description);
    onClose();
  }, [description, onSave, onClose]);

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
            className="fixed top-4 left-4 right-4 bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 md:max-w-7xl md:max-h-[90vh] md:mx-auto md:my-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Palette className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">
                  Lienzo Virtual
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearCanvas}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Limpiar lienzo"
                >
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex h-[600px] md:h-[80vh]">
              {/* Toolbar */}
              <div className="w-64 p-4 border-r border-gray-800 bg-gray-800/50">
                <div className="space-y-6">
                  {/* Tools */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Herramientas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setCurrentTool(tool.id as Tool)}
                            className={`p-3 rounded-lg transition-colors flex flex-col items-center space-y-1 ${
                              currentTool === tool.id
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Colores
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((colorOption) => (
                        <button
                          key={colorOption}
                          onClick={() => setColor(colorOption)}
                          className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                            color === colorOption
                              ? "border-white"
                              : "border-gray-600"
                          }`}
                          style={{ backgroundColor: colorOption }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Tamaño: {brushSize}px
                    </h3>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Descripción
                    </h3>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe lo que has dibujado..."
                      className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={!description.trim()}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Guardar y Enviar
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4">
                <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

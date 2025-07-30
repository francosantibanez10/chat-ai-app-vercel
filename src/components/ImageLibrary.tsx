"use client";

import React, { useState } from "react";
import { useImageLibrary } from "@/contexts/ImageLibraryContext";
import { Download, Trash2, Eye, X, Search, Filter, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLibrary({ isOpen, onClose }: ImageLibraryProps) {
  const { images, isLoading, error, deleteImage } = useImageLibrary();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "recent" | "oldest">(
    "all"
  );

  const filteredImages = images.filter((image) =>
    image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (filterType) {
      case "recent":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      default:
        return 0;
    }
  });

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated_${prompt
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      await deleteImage(imageId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Biblioteca de Imágenes
            </h2>
            <p className="text-gray-400 text-sm">
              {images.length} imagen{images.length !== 1 ? "es" : ""} generada
              {images.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por prompt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              >
                <option value="all">Todas</option>
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Cargando imágenes...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400">{error}</div>
            </div>
          ) : sortedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="mb-4">
                <Image className="w-16 h-16 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay imágenes</h3>
              <p className="text-center">
                {searchTerm
                  ? "No se encontraron imágenes con ese prompt"
                  : "Las imágenes generadas por la IA aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {sortedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-900">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => setSelectedImage(image.url)}
                      />

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image.url, image.prompt);
                            }}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(image.id);
                            }}
                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-gray-500">
                        {image.createdAt.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedImage}
                alt="Vista previa"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

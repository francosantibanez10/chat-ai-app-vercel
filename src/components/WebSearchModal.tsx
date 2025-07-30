"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ExternalLink,
  Clock,
  Globe,
  Newspaper,
  Cloud,
  BookOpen,
} from "lucide-react";
import {
  intelligentSearch,
  SearchResult,
  detectSearchType,
} from "@/lib/webSearch";
import { toast } from "react-hot-toast";

interface WebSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onResultSelect?: (result: SearchResult) => void;
}

export default function WebSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
  onResultSelect,
}: WebSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<
    "general" | "news" | "weather" | "definition"
  >("general");

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Por favor ingresa un término de búsqueda");
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      const searchResponse = await intelligentSearch(query);

      if (searchResponse.error) {
        toast.error(searchResponse.error);
        return;
      }

      setResults(searchResponse.results);
      setSearchType(detectSearchType(query));

      if (searchResponse.results.length === 0) {
        toast.info("No se encontraron resultados para tu búsqueda");
      } else {
        toast.success(
          `Se encontraron ${searchResponse.results.length} resultados`
        );
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Error al realizar la búsqueda");
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.open(result.url, "_blank");
    }
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "news":
        return <Newspaper className="w-5 h-5" />;
      case "weather":
        return <Cloud className="w-5 h-5" />;
      case "definition":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case "news":
        return "Noticias";
      case "weather":
        return "Clima";
      case "definition":
        return "Definición";
      default:
        return "Búsqueda web";
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
            className="fixed top-4 left-4 right-4 bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 md:max-w-5xl md:max-h-[80vh] md:mx-auto md:my-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  Búsqueda Web
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Busca en la web, noticias, clima, definiciones..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Search Type Indicator */}
              {results.length > 0 && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
                  {getSearchIcon()}
                  <span>{getSearchTypeLabel()}</span>
                  <span>•</span>
                  <span>{results.length} resultados</span>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto max-h-96 md:max-h-[60vh]">
              {isSearching ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Buscando en la web...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-6 space-y-4">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-2 line-clamp-2">
                            {result.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2 line-clamp-3">
                            {result.snippet}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            {result.source && (
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{result.source}</span>
                              </span>
                            )}
                            {result.publishedDate && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{result.publishedDate}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : query && !isSearching ? (
                <div className="p-6 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron resultados para "{query}"</p>
                  <p className="text-sm mt-2">
                    Intenta con términos diferentes
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa un término para buscar en la web</p>
                  <p className="text-sm mt-2">
                    Puedes buscar noticias, clima, definiciones y más
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

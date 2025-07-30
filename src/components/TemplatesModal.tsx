"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  Search,
  Briefcase,
  Palette,
  GraduationCap,
  User,
  Settings,
  Heart,
  BookOpen,
  Target,
  Share2,
  DollarSign,
} from "lucide-react";
import {
  messageTemplates,
  getTemplatesByCategory,
  searchTemplates,
  MessageTemplate,
} from "@/lib/messageTemplates";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: MessageTemplate) => void;
}

const categories = [
  { id: "business", name: "Negocios", icon: Briefcase, color: "text-blue-400" },
  { id: "creative", name: "Creativo", icon: Palette, color: "text-purple-400" },
  {
    id: "academic",
    name: "Académico",
    icon: GraduationCap,
    color: "text-green-400",
  },
  { id: "personal", name: "Personal", icon: User, color: "text-pink-400" },
  {
    id: "technical",
    name: "Técnico",
    icon: Settings,
    color: "text-orange-400",
  },
  { id: "health", name: "Salud", icon: Heart, color: "text-red-400" },
  {
    id: "education",
    name: "Educación",
    icon: BookOpen,
    color: "text-indigo-400",
  },
  {
    id: "productivity",
    name: "Productividad",
    icon: Target,
    color: "text-yellow-400",
  },
  { id: "social", name: "Social", icon: Share2, color: "text-teal-400" },
  {
    id: "finance",
    name: "Finanzas",
    icon: DollarSign,
    color: "text-emerald-400",
  },
];

export default function TemplatesModal({
  isOpen,
  onClose,
  onTemplateSelect,
}: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredTemplates = () => {
    let templates = messageTemplates;

    if (selectedCategory !== "all") {
      templates = getTemplatesByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  };

  const [selectedMode, setSelectedMode] = useState<string>("professional");
  const [previewTemplate, setPreviewTemplate] =
    useState<MessageTemplate | null>(null);

  const handleTemplateSelect = (template: MessageTemplate) => {
    // Handle both old and new template structures
    if (template.modes) {
      // New structure with modes
      const content =
        template.modes[selectedMode as keyof typeof template.modes] ||
        template.modes.professional;

      // Create a modified template with the selected mode content
      const templateWithMode = {
        ...template,
        content: content,
      };

      onTemplateSelect(templateWithMode);
    } else {
      // Old structure with direct content
      onTemplateSelect(template);
    }

    onClose();
  };

  const handlePreviewTemplate = (template: MessageTemplate) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  const getPreviewContent = (template: MessageTemplate) => {
    if (template.modes) {
      return (
        template.modes[selectedMode as keyof typeof template.modes] ||
        template.modes.professional
      );
    }
    return template.content || "";
  };

  const filteredTemplates = getFilteredTemplates();

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
            className="fixed top-4 left-4 right-4 bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 md:max-w-5xl md:max-h-[80vh] md:min-h-[600px] md:mx-auto md:my-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[80] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800">
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                <h2 className="text-lg md:text-xl font-semibold text-white truncate">
                  Plantillas de Mensajes
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </button>
            </div>

            {/* Search, Categories and Mode Selection */}
            <div className="p-3 md:p-4 border-b border-gray-800 space-y-3">
              {/* Search and Categories */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar plantillas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2 md:px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md border border-gray-600"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-1.5 md:px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md border border-gray-600"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600"
                        }`}
                        title={category.name}
                      >
                        <Icon className={`w-3 h-3 ${category.color}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selection */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="text-xs text-gray-400 flex-shrink-0">
                  Modo:
                </span>
                <div className="flex flex-wrap gap-1">
                  {["professional", "casual", "formal", "creative"].map(
                    (mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 capitalize ${
                          selectedMode === mode
                            ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md border border-gray-600"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {mode === "professional"
                          ? "Profesional"
                          : mode === "casual"
                          ? "Casual"
                          : mode === "formal"
                          ? "Formal"
                          : "Creativo"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredTemplates.length > 0 ? (
                <div className="p-6 space-y-4">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-medium">
                              {template.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded">
                              {
                                categories.find(
                                  (cat) => cat.id === template.category
                                )?.name
                              }
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                !template.complexity ||
                                template.complexity === "basic"
                                  ? "bg-green-500/20 text-green-400"
                                  : template.complexity === "intermediate"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {!template.complexity ||
                              template.complexity === "basic"
                                ? "Básico"
                                : template.complexity === "intermediate"
                                ? "Intermedio"
                                : "Avanzado"}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span>⏱️ {template.estimatedTime || "N/A"}</span>
                            <span>
                              📝{" "}
                              {template.modes
                                ? Object.keys(template.modes).length
                                : 1}{" "}
                              modos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                            title="Previsualizar"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchQuery
                      ? `No se encontraron plantillas para "${searchQuery}"`
                      : "No hay plantillas disponibles"}
                  </p>
                  <p className="text-sm mt-2">
                    {searchQuery
                      ? "Intenta con términos diferentes"
                      : "Selecciona una categoría"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Minimalist */}
            <div className="p-3 border-t border-gray-800 bg-gray-800/30">
              <p className="text-xs text-gray-500 text-center">
                Selecciona una plantilla para insertarla en tu mensaje
              </p>
            </div>
          </motion.div>

          {/* Preview Modal */}
          <AnimatePresence>
            {previewTemplate && (
              <>
                {/* Preview Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[85]"
                  onClick={handleClosePreview}
                />

                {/* Preview Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-4 left-4 right-4 bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 md:max-w-4xl md:max-h-[85vh] md:mx-auto md:my-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-[90] overflow-hidden flex flex-col"
                >
                  {/* Preview Header - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-800 space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 min-w-0 flex-1">
                      <h2 className="text-sm font-medium text-white truncate">
                        {previewTemplate.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {selectedMode === "professional"
                            ? "Profesional"
                            : selectedMode === "casual"
                            ? "Casual"
                            : selectedMode === "formal"
                            ? "Formal"
                            : "Creativo"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ⏱️ {previewTemplate.estimatedTime || "N/A"}
                        </span>
                        {/* Mode Selector - Inline */}
                        <div className="flex flex-wrap gap-1">
                          {["professional", "casual", "formal", "creative"].map(
                            (mode) => (
                              <button
                                key={mode}
                                onClick={() => setSelectedMode(mode)}
                                className={`px-1.5 md:px-2 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                                  selectedMode === mode
                                    ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md border border-gray-600"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600"
                                }`}
                              >
                                {mode === "professional"
                                  ? "Prof"
                                  : mode === "casual"
                                  ? "Casual"
                                  : mode === "formal"
                                  ? "Formal"
                                  : "Creativo"}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleTemplateSelect(previewTemplate)}
                        className="px-2 md:px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700 hover:border-gray-600"
                      >
                        Usar plantilla
                      </button>
                      <button
                        onClick={handleClosePreview}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Template Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {getPreviewContent(previewTemplate)}
                        </pre>
                      </div>
                    </div>

                    {/* Template Tips - Minimalist */}
                    {previewTemplate.tips &&
                      previewTemplate.tips.length > 0 && (
                        <div className="p-3 bg-gray-800/30 border-t border-gray-700">
                          <div className="text-xs text-gray-400">
                            💡 {previewTemplate.tips.slice(0, 2).join(" • ")}
                            {previewTemplate.tips.length > 2 && "..."}
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

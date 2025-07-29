"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  FileText,
  Settings,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const helpCategories = [
    {
      icon: MessageCircle,
      title: "Chat y Conversaciones",
      description: "Aprende a usar el chat de manera efectiva",
      color: "text-blue-400",
    },
    {
      icon: FileText,
      title: "Archivos y Documentos",
      description: "Cómo subir y analizar archivos",
      color: "text-green-400",
    },
    {
      icon: Settings,
      title: "Configuración",
      description: "Personaliza tu experiencia",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Funciones Avanzadas",
      description: "Descubre características avanzadas",
      color: "text-yellow-400",
    },
  ];

  const faqItems = [
    {
      question: "¿Cómo puedo personalizar la personalidad de Rubi?",
      answer:
        "Ve a Configuración > Personalizar Rubi-gpt y selecciona la personalidad que mejor se adapte a tus necesidades. Puedes elegir entre Útil, Creativo, Profesional, Amigable, Analítico o Casual.",
    },
    {
      question: "¿Puedo subir archivos para que Rubi los analice?",
      answer:
        "Sí, puedes subir archivos usando el botón '+' en el chat. Rubi puede analizar documentos, imágenes y otros tipos de archivos para ayudarte con tu trabajo.",
    },
    {
      question: "¿Cómo funcionan las notificaciones?",
      answer:
        "Las notificaciones te avisan cuando Rubi termina de responder. Puedes habilitarlas en Configuración > Notificaciones y gestionar los permisos desde ahí.",
    },
    {
      question: "¿Puedo cambiar el idioma de la interfaz?",
      answer:
        "Sí, ve a Configuración > Idioma y selecciona entre Español, English, Français o Deutsch. El cambio se aplica inmediatamente.",
    },
    {
      question: "¿Cómo puedo guardar mis conversaciones?",
      answer:
        "Las conversaciones se guardan automáticamente. Puedes controlar esta función en Configuración > Privacidad > Auto-guardado.",
    },
    {
      question: "¿Qué modelos de IA están disponibles?",
      answer:
        "Actualmente ofrecemos GPT-4o, GPT-4 Turbo, GPT-4 Legacy y GPT-3.5 Turbo. Puedes cambiar el modelo desde el selector en la parte superior del chat.",
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-950">
      {/* Header - Responsive */}
      <div className="bg-gray-900 border-b border-gray-800">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between pl-3 pr-1 py-1.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">Centro de Ayuda</h1>
              <p className="text-xs text-gray-400">
                Encuentra respuestas a tus preguntas
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden px-3 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">Centro de Ayuda</h1>
              <p className="text-xs text-gray-400">
                Encuentra respuestas a tus preguntas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable como el chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en la ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Categorías de ayuda */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-200">Categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {helpCategories.map((category, index) => (
                <button
                  key={index}
                  className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <div>
                      <div className="font-medium text-sm text-white">{category.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{category.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Preguntas Frecuentes {searchQuery && `(${filteredFAQ.length} resultados)`}
              </h2>
            </div>
            <div className="space-y-2">
              {filteredFAQ.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-sm text-white pr-4">{item.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-300 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/50">
            <h3 className="font-medium text-sm text-white mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-xs text-gray-400 mb-3">
              Si no encuentras la respuesta a tu pregunta, no dudes en contactarnos.
            </p>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

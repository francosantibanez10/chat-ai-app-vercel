"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CookieCategory {
  id: string;
  title: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

export default function CookiePreferencesModal({
  isOpen,
  onClose,
}: CookiePreferencesModalProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const cookieCategories: CookieCategory[] = [
    {
      id: "necessary",
      title: "Cookies estrictamente necesarias (siempre activas)",
      description:
        "Estas cookies son esenciales para que el sitio funcione y no se pueden desactivar. Ayudan con la seguridad, la autenticación de usuarios, el soporte al cliente, etc.",
      required: true,
      enabled: true,
    },
    {
      id: "analytics",
      title: "Cookies analíticas",
      description:
        "Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio. Nos permiten medir el tráfico y mejorar el rendimiento del sitio.",
      required: false,
      enabled: analyticsEnabled,
    },
    {
      id: "marketing",
      title: "Cookies de rendimiento de marketing",
      description:
        "Estas cookies nos ayudan a medir la efectividad de nuestras campañas de marketing.",
      required: false,
      enabled: marketingEnabled,
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToggle = (categoryId: string, enabled: boolean) => {
    if (categoryId === "analytics") {
      setAnalyticsEnabled(enabled);
      console.log("Cookies analíticas:", enabled);
    } else if (categoryId === "marketing") {
      setMarketingEnabled(enabled);
      console.log("Cookies de marketing:", enabled);
    }
    // Las preferencias se guardan automáticamente al cambiar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200">
            Preferencias de cookies
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6 leading-relaxed">
            Personaliza tu consentimiento para diferentes tipos de cookies. Las
            cookies estrictamente necesarias no se pueden desactivar porque son
            esenciales para el funcionamiento del sitio. Otras cookies son
            opcionales y solo se usarán si las habilitas. Puedes cambiar tu
            consentimiento en cualquier momento.{" "}
                            <a href="#" className="text-gray-300 hover:text-white underline">
              Más información
            </a>
            .
          </p>

          <div className="space-y-4">
            {cookieCategories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-700 rounded-lg"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={category.enabled}
                      onChange={(e) =>
                        handleToggle(category.id, e.target.checked)
                      }
                      disabled={category.required}
                      className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-600 rounded focus:ring-gray-500 focus:ring-2"
                    />
                    <span className="text-gray-200 font-medium">
                      {category.title}
                    </span>
                  </div>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedCategories.includes(category.id) && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer eliminado - solo se usa la X del header */}
      </div>
    </div>
  );
}

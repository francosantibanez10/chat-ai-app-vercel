"use client";

import { X, Crown, Lock, Check } from "lucide-react";
import { UserPlan, PLAN_LIMITS } from "@/lib/plans";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: UserPlan;
  suggestedPlan: UserPlan;
  feature: string;
  onUpgrade: (plan: UserPlan) => void;
}

export default function PlanUpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  suggestedPlan,
  feature,
  onUpgrade,
}: PlanUpgradeModalProps) {
  if (!isOpen) return null;

  const getFeatureIcon = () => {
    switch (feature) {
      case "images":
        return "🖼️";
      case "files":
        return "📄";
      case "excel":
        return "📊";
      case "api":
        return "🔌";
      default:
        return "✨";
    }
  };

  const getFeatureName = () => {
    switch (feature) {
      case "images":
        return "Análisis de imágenes";
      case "files":
        return "Generación de archivos";
      case "excel":
        return "Archivos Excel y Word";
      case "api":
        return "Acceso a API";
      default:
        return "Función premium";
    }
  };

  const plans = [
    {
      name: "Free",
      price: "Gratis",
      features: [
        `${PLAN_LIMITS.free.maxMessagesPerDay} mensajes/día`,
        "GPT-3.5-turbo",
        "Sin análisis de imágenes",
        "Sin generación de archivos",
      ],
      current: currentPlan === "free",
      recommended: false,
    },
    {
      name: "Plus",
      price: "$14.99/mes",
      features: [
        `${PLAN_LIMITS.plus.maxMessagesPerDay} mensajes/día`,
        "GPT-4o",
        "Análisis de imágenes",
        "Generación básica (PDF, TXT, imágenes)",
        `${(PLAN_LIMITS.plus.maxFileSize / 1024 / 1024).toFixed(
          0
        )}MB por archivo`,
      ],
      current: currentPlan === "plus",
      recommended: suggestedPlan === "plus",
    },
    {
      name: "Pro",
      price: "$159.99/mes",
      features: [
        "Mensajes ilimitados",
        "Todos los modelos",
        "Análisis de imágenes",
        "Todos los tipos de archivo",
        "Acceso a API",
        `${(PLAN_LIMITS.pro.maxFileSize / 1024 / 1024).toFixed(
          0
        )}MB por archivo`,
      ],
      current: currentPlan === "pro",
      recommended: suggestedPlan === "pro",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4">
      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getFeatureIcon()}</div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {getFeatureName()} Requiere Actualización
              </h2>
              <p className="text-gray-400 text-sm">
                Tu plan actual no incluye esta función
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-4 sm:p-6 rounded-lg border min-h-[280px] flex flex-col ${
                plan.current
                  ? "border-blue-500 bg-blue-900/20"
                  : plan.recommended
                  ? "border-purple-500 bg-purple-900/20"
                  : "border-gray-600 bg-gray-800"
              }`}
            >
              {plan.current && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Actual
                </div>
              )}
              {plan.recommended && !plan.current && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Recomendado
                </div>
              )}

              <div className="flex items-center space-x-2 mb-3">
                {plan.name === "Pro" ? (
                  <Crown className="w-5 h-5 text-purple-500 flex-shrink-0" />
                ) : plan.name === "Plus" ? (
                  <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  {plan.name}
                </h3>
              </div>

              <div className="text-lg sm:text-2xl font-bold text-white mb-4">
                {plan.price}
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {!plan.current && (
                <button
                  onClick={() => onUpgrade(plan.name.toLowerCase() as UserPlan)}
                  className={`w-full py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base mt-auto ${
                    plan.recommended
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  {plan.recommended ? "Actualizar Ahora" : "Seleccionar"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            ¿Tienes preguntas sobre los planes?{" "}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Contacta soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Crown, Lock, Check, X } from "lucide-react";
import { UserPlan, PLAN_LIMITS } from "@/lib/plans";

interface PlanLimitsDisplayProps {
  currentPlan: UserPlan;
  onUpgrade?: (plan: UserPlan) => void;
}

export default function PlanLimitsDisplay({ currentPlan, onUpgrade }: PlanLimitsDisplayProps) {
  const currentLimits = PLAN_LIMITS[currentPlan];
  const isFree = currentPlan === "free";
  const isPlus = currentPlan === "plus";

  const features = [
    {
      name: "Mensajes por día",
      free: `${PLAN_LIMITS.free.maxMessagesPerDay} mensajes`,
      plus: `${PLAN_LIMITS.plus.maxMessagesPerDay} mensajes`,
      pro: "Ilimitados",
      current: currentPlan === "free" ? `${PLAN_LIMITS.free.maxMessagesPerDay} mensajes` : 
               currentPlan === "plus" ? `${PLAN_LIMITS.plus.maxMessagesPerDay} mensajes` : "Ilimitados"
    },
    {
      name: "Análisis de imágenes",
      free: false,
      plus: true,
      pro: true,
      current: currentLimits.canAnalyzeImages
    },
    {
      name: "Generación de archivos",
      free: false,
      plus: "Básicos (PDF, TXT, imágenes)",
      pro: "Todos los tipos",
      current: currentLimits.canGenerateFiles ? 
        (currentPlan === "plus" ? "Básicos" : "Todos") : false
    },
    {
      name: "Archivos Excel/Word",
      free: false,
      plus: false,
      pro: true,
      current: currentPlan === "pro"
    },
    {
      name: "Tamaño de archivos",
      free: "1MB",
      plus: "10MB",
      pro: "50MB",
      current: `${(currentLimits.maxFileSize / 1024 / 1024).toFixed(0)}MB`
    },
    {
      name: "API Access",
      free: false,
      plus: false,
      pro: true,
      current: currentLimits.canUseAPI
    }
  ];

  const getFeatureIcon = (feature: any) => {
    if (typeof feature.current === "boolean") {
      return feature.current ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      );
    }
    return <span className="text-sm text-gray-300">{feature.current}</span>;
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "free":
        return <Lock className="w-5 h-5 text-gray-400" />;
      case "plus":
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case "pro":
        return <Crown className="w-5 h-5 text-purple-500" />;
    }
  };

  const getPlanColor = () => {
    switch (currentPlan) {
      case "free":
        return "text-gray-400";
      case "plus":
        return "text-yellow-500";
      case "pro":
        return "text-purple-500";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPlanIcon()}
          <h3 className={`font-medium ${getPlanColor()}`}>
            Plan {currentPlan.toUpperCase()}
          </h3>
        </div>
        {isFree && onUpgrade && (
          <button
            onClick={() => onUpgrade("plus")}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            Actualizar
          </button>
        )}
        {isPlus && onUpgrade && (
          <button
            onClick={() => onUpgrade("pro")}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
          >
            Ir a Pro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Mensajes por día:</span>
              <span className={isFree ? "text-red-400" : "text-green-400"}>
                {currentLimits.maxMessagesPerDay === -1 ? "Ilimitados" : currentLimits.maxMessagesPerDay}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tamaño de archivo:</span>
              <span className={isFree ? "text-red-400" : "text-green-400"}>
                {(currentLimits.maxFileSize / 1024 / 1024).toFixed(0)}MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Análisis de imágenes:</span>
              <span className={currentLimits.canAnalyzeImages ? "text-green-400" : "text-red-400"}>
                {currentLimits.canAnalyzeImages ? "✓" : "✗"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Generación de archivos:</span>
              <span className={currentLimits.canGenerateFiles ? "text-green-400" : "text-red-400"}>
                {currentLimits.canGenerateFiles ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>API Access:</span>
              <span className={currentLimits.canUseAPI ? "text-green-400" : "text-red-400"}>
                {currentLimits.canUseAPI ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Modelos disponibles:</span>
              <span className="text-blue-400">
                {currentLimits.allowedModels.length}
              </span>
            </div>
          </div>
        </div>

      {isFree && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Actualiza a Plus ($14.99/mes)</strong> para acceder a análisis de imágenes, generación de archivos y más mensajes diarios.
          </p>
        </div>
      )}

      {isPlus && (
        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
          <p className="text-purple-300 text-sm">
            <strong>Actualiza a Pro ($159.99/mes)</strong> para acceder a Excel, Word, API y funciones avanzadas.
          </p>
        </div>
      )}
    </div>
  );
} 
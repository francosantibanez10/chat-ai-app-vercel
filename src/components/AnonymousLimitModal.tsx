"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, MessageSquare, Plus, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ANONYMOUS_LIMITS } from "@/lib/anonymousLimits";

interface AnonymousLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "messages" | "conversations" | "time";
}

export const AnonymousLimitModal: React.FC<AnonymousLimitModalProps> = ({
  isOpen,
  onClose,
  limitType
}) => {
  const router = useRouter();

  const getLimitInfo = () => {
    switch (limitType) {
      case "messages":
        return {
          title: "Límite de mensajes alcanzado",
          description: `Has enviado ${ANONYMOUS_LIMITS.MAX_MESSAGES} mensajes en tu prueba gratuita.`,
          icon: <MessageSquare className="w-8 h-8" />,
          feature: "mensajes ilimitados"
        };
      case "conversations":
        return {
          title: "Límite de conversaciones alcanzado",
          description: `Has creado ${ANONYMOUS_LIMITS.MAX_CONVERSATIONS} conversaciones en tu prueba gratuita.`,
          icon: <Plus className="w-8 h-8" />,
          feature: "conversaciones ilimitadas"
        };
      case "time":
        return {
          title: "Prueba gratuita expirada",
          description: `Han pasado ${ANONYMOUS_LIMITS.TRIAL_DURATION_HOURS} horas desde que comenzaste tu prueba gratuita.`,
          icon: <Clock className="w-8 h-8" />,
          feature: "acceso sin límites de tiempo"
        };
    }
  };

  const limitInfo = getLimitInfo();

  const handleCreateAccount = () => {
    router.push("/register");
    onClose();
  };

  const handleUpgrade = () => {
    router.push("/register");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                  {limitInfo.icon}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {limitInfo.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                {limitInfo.description}
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-white">
                    Desbloquea {limitInfo.feature}
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Mensajes ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Conversaciones ilimitadas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Acceso sin límites de tiempo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Funciones avanzadas</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleCreateAccount}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Crear cuenta gratis
                </button>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-gray-600"
                >
                  Ver planes premium
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                No se requiere tarjeta de crédito • Cancelación en cualquier momento
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
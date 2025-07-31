"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Shield,
  Clock,
  Info,
} from "lucide-react";

interface ErrorNotificationProps {
  error: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTime?: number;
  type?: "error" | "warning" | "info" | "network" | "auth" | "permission";
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  autoDismiss = true,
  dismissTime = 5000,
  type = "error",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, dismissTime);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoDismiss, dismissTime]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!error) return null;

  const getErrorConfig = () => {
    const errorMessage = typeof error === "string" ? error : error.message;

    switch (type) {
      case "network":
        return {
          icon: <WifiOff className="w-5 h-5" />,
          bgColor: "bg-orange-500",
          borderColor: "border-orange-600",
          textColor: "text-orange-100",
          title: "Error de conexión",
          message: errorMessage.includes("network")
            ? errorMessage
            : "Problema de conectividad detectado",
        };
      case "auth":
        return {
          icon: <Shield className="w-5 h-5" />,
          bgColor: "bg-red-500",
          borderColor: "border-red-600",
          textColor: "text-red-100",
          title: "Error de autenticación",
          message: errorMessage,
        };
      case "permission":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: "bg-yellow-500",
          borderColor: "border-yellow-600",
          textColor: "text-yellow-100",
          title: "Permisos insuficientes",
          message: errorMessage,
        };
      case "warning":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: "bg-yellow-500",
          borderColor: "border-yellow-600",
          textColor: "text-yellow-100",
          title: "Advertencia",
          message: errorMessage,
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: "bg-blue-500",
          borderColor: "border-blue-600",
          textColor: "text-blue-100",
          title: "Información",
          message: errorMessage,
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: "bg-red-500",
          borderColor: "border-red-600",
          textColor: "text-red-100",
          title: "Error",
          message: errorMessage,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-[100] max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg overflow-hidden`}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${config.textColor}`}>
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${config.textColor}`}>
                  {config.title}
                </h3>
                <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
                  {config.message}
                </p>

                {/* Acciones */}
                <div className="flex items-center space-x-2 mt-3">
                  {onRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${config.textColor} bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50`}
                    >
                      <RefreshCw
                        className={`w-3 h-3 mr-1 ${
                          isRetrying ? "animate-spin" : ""
                        }`}
                      />
                      {isRetrying ? "Reintentando..." : "Reintentar"}
                    </button>
                  )}

                  {!autoDismiss && (
                    <button
                      onClick={handleDismiss}
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${config.textColor} bg-white/20 hover:bg-white/30 transition-colors`}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cerrar
                    </button>
                  )}
                </div>
              </div>

              {/* Botón de cerrar */}
              {autoDismiss && (
                <button
                  onClick={handleDismiss}
                  className={`flex-shrink-0 ${config.textColor} hover:bg-white/20 rounded-full p-1 transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Barra de progreso para auto-dismiss */}
          {autoDismiss && (
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: dismissTime / 1000, ease: "linear" }}
              className="h-1 bg-white/30"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

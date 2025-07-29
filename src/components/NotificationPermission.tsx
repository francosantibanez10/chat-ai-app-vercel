"use client";

import { useState } from "react";
import { Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationPermission() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-yellow-700/50 bg-yellow-900/10">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <div className="flex-1">
          <div className="font-medium text-sm text-yellow-400">Notificaciones no soportadas</div>
          <div className="text-xs text-yellow-300">
            Tu navegador no soporta notificaciones push
          </div>
        </div>
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-700/50 bg-green-900/10">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <div className="flex-1">
          <div className="font-medium text-sm text-green-400">Notificaciones habilitadas</div>
          <div className="text-xs text-green-300">
            Recibirás notificaciones cuando Rubi responda
          </div>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-red-700/50 bg-red-900/10">
        <BellOff className="w-4 h-4 text-red-400" />
        <div className="flex-1">
          <div className="font-medium text-sm text-red-400">Notificaciones bloqueadas</div>
          <div className="text-xs text-red-300">
            Habilita las notificaciones en la configuración de tu navegador
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700/50 bg-gray-900/10">
      <div className="flex items-center space-x-3">
        <Bell className="w-4 h-4 text-gray-400" />
        <div>
          <div className="font-medium text-sm text-gray-400">Habilitar notificaciones</div>
          <div className="text-xs text-gray-300">
            Recibe notificaciones cuando Rubi responda
          </div>
        </div>
      </div>
      <button
        onClick={handleRequestPermission}
        disabled={isRequesting}
        className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      >
        {isRequesting ? "Solicitando..." : "Habilitar"}
      </button>
    </div>
  );
} 
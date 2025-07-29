"use client";

import { useState } from "react";
import { ArrowLeft, Bell, Shield, Globe, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import NotificationPermission from "@/components/NotificationPermission";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-950">
      {/* Header - Responsive */}
      <div className="bg-gray-900 border-b border-gray-800">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center pl-3 pr-1 py-1.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">Configuración</h1>
              <p className="text-xs text-gray-400">
                Gestiona tus preferencias y configuraciones
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
              <h1 className="text-lg font-medium text-white">Configuración</h1>
              <p className="text-xs text-gray-400">
                Gestiona tus preferencias y configuraciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable como el chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Apariencia */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-200">Apariencia</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  {settings.darkMode ? (
                    <Moon className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-400" />
                  )}
                  <div>
                    <div className="font-medium text-sm text-white">
                      Modo oscuro
                    </div>
                    <div className="text-xs text-gray-400">
                      Usar tema oscuro en la interfaz
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange("darkMode", !settings.darkMode)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Notificaciones
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                <div>
                  <div className="font-medium text-sm text-white">
                    Notificaciones push
                  </div>
                  <div className="text-xs text-gray-400">
                    Recibir notificaciones en tiempo real
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      !settings.notifications
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Componente de permisos de notificación */}
              <NotificationPermission />
            </div>
          </div>

          {/* Idioma */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-medium text-gray-200">Idioma</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: "es", name: "Español", flag: "🇪🇸" },
                { id: "en", name: "English", flag: "🇺🇸" },
                { id: "fr", name: "Français", flag: "🇫🇷" },
                { id: "de", name: "Deutsch", flag: "🇩🇪" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSettingChange("language", option.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.language === option.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{option.flag}</span>
                    <span className="font-medium text-sm text-white">
                      {option.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacidad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-medium text-gray-200">Privacidad</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                <div>
                  <div className="font-medium text-sm text-white">
                    Modo privado
                  </div>
                  <div className="text-xs text-gray-400">
                    No guardar historial de conversaciones
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange("privacyMode", !settings.privacyMode)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacyMode ? "bg-red-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacyMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                <div>
                  <div className="font-medium text-sm text-white">
                    Auto-guardado
                  </div>
                  <div className="text-xs text-gray-400">
                    Guardar automáticamente las conversaciones
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange("autoSave", !settings.autoSave)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSave ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSave ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

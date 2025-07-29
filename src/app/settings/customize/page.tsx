"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Palette,
  MessageSquare,
  Zap,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";

export default function CustomizePage() {
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
              <h1 className="text-lg font-medium text-white">
                Personalizar Rubi-gpt
              </h1>
              <p className="text-xs text-gray-400">
                Ajusta cómo responde y se comporta tu asistente
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
              <h1 className="text-lg font-medium text-white">
                Personalizar Rubi-gpt
              </h1>
              <p className="text-xs text-gray-400">
                Ajusta cómo responde y se comporta tu asistente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable como el chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Personalidad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Personalidad
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  id: "helpful",
                  name: "Útil",
                  desc: "Siempre dispuesto a ayudar",
                },
                {
                  id: "creative",
                  name: "Creativo",
                  desc: "Imaginativo e innovador",
                },
                {
                  id: "professional",
                  name: "Profesional",
                  desc: "Formal y preciso",
                },
                { id: "friendly", name: "Amigable", desc: "Cálido y cercano" },
                {
                  id: "analytical",
                  name: "Analítico",
                  desc: "Detallista y lógico",
                },
                { id: "casual", name: "Casual", desc: "Relajado y natural" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSettingChange("personality", option.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.personality === option.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="font-medium text-sm text-white">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tono de respuesta */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Tono de respuesta
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  id: "professional",
                  name: "Profesional",
                  desc: "Formal y respetuoso",
                },
                { id: "casual", name: "Casual", desc: "Relajado y amigable" },
                {
                  id: "enthusiastic",
                  name: "Entusiasta",
                  desc: "Energético y motivador",
                },
                { id: "calm", name: "Tranquilo", desc: "Sereno y paciente" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSettingChange("tone", option.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.tone === option.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="font-medium text-sm text-white">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Longitud de respuesta */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Longitud de respuesta
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { id: "short", name: "Corta", desc: "Respuestas concisas" },
                {
                  id: "medium",
                  name: "Media",
                  desc: "Respuestas equilibradas",
                },
                { id: "long", name: "Larga", desc: "Respuestas detalladas" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleSettingChange("responseLength", option.id)
                  }
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.responseLength === option.id
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="font-medium text-sm text-white">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de creatividad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-medium text-gray-200">
                Nivel de creatividad
              </h2>
            </div>
            <div className="space-y-2">
              {[
                {
                  id: "conservative",
                  name: "Conservador",
                  desc: "Respuestas más predecibles",
                },
                {
                  id: "balanced",
                  name: "Equilibrado",
                  desc: "Balance entre creatividad y precisión",
                },
                {
                  id: "creative",
                  name: "Creativo",
                  desc: "Respuestas más imaginativas",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSettingChange("creativity", option.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    settings.creativity === option.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="font-medium text-sm text-white">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

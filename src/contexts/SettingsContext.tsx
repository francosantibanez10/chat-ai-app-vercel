"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Settings {
  // Personalización de Rubi-gpt
  personality: "helpful" | "creative" | "professional" | "friendly" | "analytical" | "casual";
  tone: "professional" | "casual" | "enthusiastic" | "calm";
  responseLength: "short" | "medium" | "long";
  creativity: "conservative" | "balanced" | "creative";
  
  // Configuración general
  darkMode: boolean;
  notifications: boolean;
  language: "es" | "en" | "fr" | "de";
  autoSave: boolean;
  privacyMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  personality: "helpful",
  tone: "professional",
  responseLength: "medium",
  creativity: "balanced",
  darkMode: true,
  notifications: true,
  language: "es",
  autoSave: true,
  privacyMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuraciones al inicializar
  useEffect(() => {
    loadSettings();
  }, []);

  // Aplicar modo oscuro cuando cambie
  useEffect(() => {
    if (isLoaded) {
      applyDarkMode(settings.darkMode);
    }
  }, [settings.darkMode, isLoaded]);

  // Aplicar idioma cuando cambie
  useEffect(() => {
    if (isLoaded) {
      applyLanguage(settings.language);
    }
  }, [settings.language, isLoaded]);

  // Guardar configuraciones automáticamente cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("rubi-settings", JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const applyDarkMode = (darkMode: boolean) => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const applyLanguage = (language: string) => {
    document.documentElement.lang = language;
    // Aquí podrías implementar i18n si lo necesitas
  };

  const loadSettings = async () => {
    try {
      // Intentar cargar desde localStorage
      const savedSettings = localStorage.getItem("rubi-settings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async () => {
    try {
      // Guardar en localStorage
      localStorage.setItem("rubi-settings", JSON.stringify(settings));
      
      // Aquí podrías guardar en Firebase o tu backend
      // await saveSettingsToBackend(settings);
      
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        saveSettings,
        loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
} 
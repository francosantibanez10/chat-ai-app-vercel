"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserPlan, getUserPlan, getPlanLimits, PLAN_LIMITS } from "@/lib/plans";

interface PlanContextType {
  currentPlan: UserPlan;
  planLimits: typeof PLAN_LIMITS[UserPlan];
  updatePlan: (plan: UserPlan) => void;
  canUseFeature: (feature: string) => boolean;
  getUpgradeMessage: (feature: string) => string;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
  initialPlan?: UserPlan;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ 
  children, 
  initialPlan = "free" 
}) => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>(initialPlan);

  const planLimits = getPlanLimits({ plan: currentPlan });

  const updatePlan = (plan: UserPlan) => {
    setCurrentPlan(plan);
    // Aquí podrías guardar el plan en localStorage o en tu backend
    localStorage.setItem("userPlan", plan);
  };

  const canUseFeature = (feature: string): boolean => {
    switch (feature) {
      case "images":
        return planLimits.canAnalyzeImages;
      case "files":
        return planLimits.canGenerateFiles;
      case "excel":
        return planLimits.allowedFileTypes.includes("excel");
      case "docx":
        return planLimits.allowedFileTypes.includes("docx");
      case "api":
        return planLimits.canUseAPI;
      case "gpt4":
        return planLimits.allowedModels.includes("gpt-4o");
      default:
        return false;
    }
  };

  const getUpgradeMessage = (feature: string): string => {
    const messages = {
      free: {
        images: "Análisis de imágenes requiere plan Plus o superior.",
        files: "Análisis de archivos requiere plan Plus o superior.",
        gpt4: "GPT-4 requiere plan Plus o superior.",
        excel: "Generación de Excel requiere plan Pro.",
        api: "API requiere plan Pro.",
      },
      plus: {
        excel: "Generación de Excel requiere plan Pro.",
        docx: "Generación de DOCX requiere plan Pro.",
        api: "API requiere plan Pro.",
      },
      pro: {
        excel: "Generación de Excel disponible.",
        docx: "Generación de DOCX disponible.",
        api: "API disponible.",
      }
    };

    return messages[currentPlan]?.[feature] || "Esta función requiere un plan superior.";
  };

  // Cargar plan desde localStorage al inicializar
  useEffect(() => {
    const savedPlan = localStorage.getItem("userPlan") as UserPlan;
    if (savedPlan && Object.keys(PLAN_LIMITS).includes(savedPlan)) {
      setCurrentPlan(savedPlan);
    }
  }, []);

  const value: PlanContextType = {
    currentPlan,
    planLimits,
    updatePlan,
    canUseFeature,
    getUpgradeMessage,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}; 
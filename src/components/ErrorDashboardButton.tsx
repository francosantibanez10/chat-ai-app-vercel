"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, X } from "lucide-react";
import { ErrorDashboard } from "./ErrorDashboard";

interface ErrorDashboardButtonProps {
  className?: string;
}

export const ErrorDashboardButton: React.FC<ErrorDashboardButtonProps> = ({
  className = "",
}) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDashboardOpen(true)}
        className={`fixed bottom-4 left-4 p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-red-500/25 transition-all duration-200 z-50 border border-red-400 ${className}`}
        title="Dashboard de Errores"
      >
        <BarChart3 className="w-5 h-5" />
      </motion.button>

      {/* Dashboard */}
      <ErrorDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </>
  );
}; 
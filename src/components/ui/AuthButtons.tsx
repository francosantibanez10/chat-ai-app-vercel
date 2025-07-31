"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneAuthModal } from "./PhoneAuthModal";

interface AuthButtonsProps {
  onGoogleClick?: () => void;
  onGitHubClick?: () => void;
  onPhoneClick?: () => void;
  loading?: boolean;
  variant?: "default" | "compact";
  showPhone?: boolean;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  onGoogleClick,
  onGitHubClick,
  onPhoneClick,
  loading = false,
  variant = "default",
  showPhone = false,
}) => {
  const { signInWithGoogle, signInWithGitHub, signInWithPhone } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleGoogleSignIn = async () => {
    if (onGoogleClick) {
      onGoogleClick();
    } else {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Error signing in with Google:", error);
      }
    }
  };

  const handleGitHubSignIn = async () => {
    if (onGitHubClick) {
      onGitHubClick();
    } else {
      try {
        await signInWithGitHub();
      } catch (error) {
        console.error("Error signing in with GitHub:", error);
      }
    }
  };

  const handlePhoneSignIn = () => {
    if (onPhoneClick) {
      onPhoneClick();
    } else {
      setShowPhoneModal(true);
    }
  };

  const handlePhoneSuccess = () => {
    // El usuario se autenticó exitosamente
    console.log("Phone authentication successful");
  };

  const buttonClasses =
    variant === "compact"
      ? "flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      : "group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";

  return (
    <div className="space-y-3">
      {/* Google Button */}
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={buttonClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {variant === "compact" ? "Google" : "Continuar con Google"}
      </motion.button>

      {/* GitHub Button */}
      <motion.button
        type="button"
        onClick={handleGitHubSignIn}
        disabled={loading}
        className={buttonClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        {variant === "compact" ? "GitHub" : "Continuar con GitHub"}
      </motion.button>

      {/* Phone Button (Optional) */}
      {showPhone && (
        <motion.button
          type="button"
          onClick={handlePhoneSignIn}
          disabled={loading}
          className={buttonClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          {variant === "compact" ? "Teléfono" : "Continuar con Teléfono"}
        </motion.button>
      )}
    </div>

    {/* Phone Auth Modal */}
    <PhoneAuthModal
      isOpen={showPhoneModal}
      onClose={() => setShowPhoneModal(false)}
      onSuccess={handlePhoneSuccess}
    />
  );
};

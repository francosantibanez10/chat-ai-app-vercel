"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageSquare, Plus, Crown, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getAnonymousLimits,
  getRemainingMessages,
  getRemainingConversations,
  getTrialTimeRemaining,
  ANONYMOUS_LIMITS
} from "@/lib/anonymousLimits";

interface AnonymousTrialBannerProps {
  onUpgrade?: () => void;
  onRegister?: () => void;
}

export const AnonymousTrialBanner: React.FC<AnonymousTrialBannerProps> = ({
  onUpgrade,
  onRegister
}) => {
  const { isAnonymous } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(getTrialTimeRemaining());
  const [remainingMessages, setRemainingMessages] = useState(getRemainingMessages());
  const [remainingConversations, setRemainingConversations] = useState(getRemainingConversations());

  useEffect(() => {
    if (!isAnonymous) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTrialTimeRemaining());
      setRemainingMessages(getRemainingMessages());
      setRemainingConversations(getRemainingConversations());
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnonymous]);

  if (!isAnonymous) return null;

  const limits = getAnonymousLimits();
  const isExpired = limits.isExpired;
  const isNearLimit = remainingMessages <= 2 || remainingConversations <= 1;

  const formatTime = (hours: number, minutes: number): string => {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/register");
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      router.push("/register");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-[100] p-4 ${
            isExpired 
              ? 'bg-gradient-to-r from-red-600 to-red-700' 
              : isNearLimit 
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                : 'bg-gradient-to-r from-blue-600 to-blue-700'
          } text-white shadow-lg`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Trial Status */}
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">
                  {isExpired ? "Prueba gratuita expirada" : "Prueba gratuita"}
                </span>
              </div>

              {/* Time Remaining */}
              {!isExpired && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatTime(timeRemaining.hours, timeRemaining.minutes)} restantes
                  </span>
                </div>
              )}

              {/* Messages Remaining */}
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">
                  {remainingMessages}/{ANONYMOUS_LIMITS.MAX_MESSAGES} mensajes
                </span>
              </div>

              {/* Conversations Remaining */}
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm">
                  {remainingConversations}/{ANONYMOUS_LIMITS.MAX_CONVERSATIONS} conversaciones
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isExpired ? (
                <button
                  onClick={handleUpgrade}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Crear cuenta
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRegister}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Crear cuenta
                  </button>
                  <button
                    onClick={handleUpgrade}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Actualizar
                  </button>
                </>
              )}
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
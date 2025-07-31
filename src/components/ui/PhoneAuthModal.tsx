"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithPhone, verifyPhoneCode } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validar formato de teléfono
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        throw new Error("Por favor ingresa un número de teléfono válido");
      }

      const result = await signInWithPhone(phoneNumber);
      setVerificationId(result.verificationId);
      setStep("code");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyPhoneCode(verificationId, verificationCode);
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setError("");
    setVerificationCode("");
  };

  const formatPhoneNumber = (value: string) => {
    // Remover todos los caracteres no numéricos excepto +
    const cleaned = value.replace(/[^\d+]/g, "");
    
    // Si no empieza con +, agregarlo
    if (!cleaned.startsWith("+")) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[90]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 flex items-center justify-center z-[91] md:inset-0 md:flex md:items-center md:justify-center"
          >
            <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {step === "phone" ? "Verificar teléfono" : "Código de verificación"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === "phone" ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Número de teléfono
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                          placeholder="+34 600 000 000"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Te enviaremos un código SMS para verificar tu número
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Enviando código..." : "Enviar código"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de verificación
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          maxLength={6}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Ingresa el código de 6 dígitos que recibiste por SMS
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Atrás</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Verificando..." : "Verificar"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container" className="fixed bottom-4 right-4 z-[92]" />
        </>
      )}
    </AnimatePresence>
  );
}; 
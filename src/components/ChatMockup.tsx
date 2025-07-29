"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, Bot, User } from "lucide-react";

export default function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Mockup del chat */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Rubi</h3>
            <p className="text-gray-400 text-sm">En línea</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="space-y-4 mb-6">
          {/* Mensaje del bot */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
              <p className="text-gray-200 text-sm">
                ¡Hola! Soy Rubi. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          </div>

          {/* Mensaje del usuario */}
          <div className="flex items-start space-x-3 justify-end">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
              <p className="text-white text-sm">
                ¿Puedes ayudarme a analizar este documento?
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Respuesta del bot */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
              <p className="text-gray-200 text-sm">
                ¡Por supuesto! Sube el archivo y te ayudo a analizarlo...
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center space-x-3 bg-gray-700 rounded-xl px-4 py-3">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            disabled
          />
          <button className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 animate-pulse-slow"></div>
    </motion.div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";

export default function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-sm sm:max-w-md mx-auto"
    >
      {/* Chat Container */}
      <div className="flex flex-col bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-3 px-6 py-4 bg-gray-800">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Rubi</h3>
            <p className="text-gray-400 text-xs">En línea</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 bg-gray-900">
          {/* Bot Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
              <p className="text-gray-200 text-sm">
                ¡Hola! Soy Rubi. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          </motion.div>

          {/* User Message */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-start space-x-3 justify-end"
          >
            <div className="bg-gray-700 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
              <p className="text-white text-sm">
                ¿Puedes ayudarme a analizar este documento?
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-300" />
            </div>
          </motion.div>

          {/* Typing Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce-delay" />
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce-delay-200" />
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce-delay-400" />
            </div>
          </motion.div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-gray-800 flex items-center space-x-3 border-t border-gray-700">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-500 outline-none text-sm rounded-lg px-4 py-2 border border-gray-700 focus:ring-2 focus:ring-gray-600 transition-all"
          />
          <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gray-700 rounded-3xl blur-3xl -z-10 opacity-20"></div>
    </motion.div>
  );
}

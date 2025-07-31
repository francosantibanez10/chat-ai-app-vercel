import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Bot, User } from "lucide-react";

export default function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-sm sm:max-w-md mx-auto"
    >
      {/* Chat Container */}
      <div className="flex flex-col bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Rubi</h3>
            <p className="text-blue-200 text-xs">En línea</p>
          </div>
          <MessageCircle className="w-6 h-6 text-white hover:text-gray-200 transition-colors cursor-pointer" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {/* Bot Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
              <p className="text-white text-sm">
                ¿Puedes ayudarme a analizar este documento?
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          </motion.div>

          {/* Typing Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3 flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-delay" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-delay-200" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-delay-400" />
            </div>
          </motion.div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-gray-700 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-gray-600/50 text-white placeholder-gray-400 outline-none text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 animate-pulse-slow"></div>
    </motion.div>
  );
}

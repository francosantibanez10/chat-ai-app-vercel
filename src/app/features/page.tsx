"use client";

import { motion } from "framer-motion";
import { Crown, Zap, Star, Bot, FileText, Image, MessageSquare, Shield, Clock, Users, Globe, Lock } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const features = [
  {
    icon: Bot,
    title: "IA Conversacional Avanzada",
    description: "Diálogos naturales con GPT-4o que entienden contexto y mantienen memoria de conversación.",
    category: "core"
  },
  {
    icon: FileText,
    title: "Análisis de Documentos",
    description: "Sube PDFs, Word, Excel y obtén insights inteligentes al instante.",
    category: "core"
  },
  {
    icon: Image,
    title: "Análisis de Imágenes",
    description: "Analiza fotos, diagramas y gráficos con visión computacional avanzada.",
    category: "core"
  },
  {
    icon: MessageSquare,
    title: "Chat Multimodal",
    description: "Combina texto, imágenes y archivos en una sola conversación.",
    category: "core"
  },
  {
    icon: Shield,
    title: "Seguridad Enterprise",
    description: "Encriptación de extremo a extremo y cumplimiento GDPR.",
    category: "enterprise"
  },
  {
    icon: Clock,
    title: "Respuestas Instantáneas",
    description: "Velocidad de respuesta optimizada para máxima productividad.",
    category: "performance"
  },
  {
    icon: Users,
    title: "Colaboración en Equipo",
    description: "Comparte conversaciones y análisis con tu equipo.",
    category: "collaboration"
  },
  {
    icon: Globe,
    title: "Múltiples Idiomas",
    description: "Soporte para más de 50 idiomas con traducción automática.",
    category: "global"
  },
  {
    icon: Lock,
    title: "Privacidad Total",
    description: "Tus datos nunca se usan para entrenar modelos externos.",
    category: "privacy"
  }
];

const plans = [
  {
    name: "Gratis",
    icon: Star,
    features: ["5 chats por día", "GPT-3.5", "Archivos hasta 5MB", "Soporte por email"],
    color: "text-gray-400"
  },
  {
    name: "Plus",
    icon: Zap,
    features: ["Chats ilimitados", "GPT-4o", "Archivos hasta 50MB", "Análisis de imágenes", "Soporte prioritario"],
    color: "text-gray-300"
  },
  {
    name: "Pro",
    icon: Crown,
    features: ["Todo de Plus", "Modelos avanzados", "Archivos hasta 500MB", "API personalizada", "Soporte 24/7"],
    color: "text-gray-300"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-gray-300" />
                <span className="text-2xl font-bold text-white">Rubi</span>
              </div>
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ← Volver al inicio
              </a>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Características
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Descubre todo lo que Rubi puede hacer por ti. Una plataforma completa de IA diseñada para potenciar tu productividad.
            </motion.p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <feature.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Comparison */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Planes y Características</h2>
              <p className="text-xl text-gray-400">Elige el plan que mejor se adapte a tus necesidades</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                      <plan.icon className={`w-10 h-10 ${plan.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">¿Listo para empezar?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Únete a miles de usuarios que ya están potenciando su productividad con Rubi
              </p>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Crear cuenta gratis
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
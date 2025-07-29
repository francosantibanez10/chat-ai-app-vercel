"use client";

import { motion } from "framer-motion";
import { Crown, Cookie, Settings, Shield, Eye, Database, Clock, CheckCircle } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const cookieTypes = [
  {
    icon: Cookie,
    title: "Cookies Esenciales",
    description: "Necesarias para el funcionamiento básico del sitio",
    examples: ["Sesión de usuario", "Autenticación", "Carrito de compras"],
    duration: "Sesión",
    required: true
  },
  {
    icon: Settings,
    title: "Cookies de Preferencias",
    description: "Mejoran tu experiencia personalizando el contenido",
    examples: ["Idioma preferido", "Configuración de tema", "Preferencias de notificaciones"],
    duration: "1 año",
    required: false
  },
  {
    icon: Database,
    title: "Cookies Analíticas",
    description: "Nos ayudan a entender cómo usas nuestro sitio",
    examples: ["Páginas visitadas", "Tiempo en el sitio", "Fuentes de tráfico"],
    duration: "2 años",
    required: false
  },
  {
    icon: Eye,
    title: "Cookies de Marketing",
    description: "Utilizadas para mostrar publicidad relevante",
    examples: ["Anuncios personalizados", "Retargeting", "Análisis de campañas"],
    duration: "1 año",
    required: false
  }
];

const cookieManagement = [
  {
    icon: Settings,
    title: "Configuración del Navegador",
    description: "Puedes configurar tu navegador para rechazar cookies o recibir notificaciones cuando se envíen.",
    steps: [
      "Chrome: Configuración > Privacidad y seguridad > Cookies",
      "Firefox: Opciones > Privacidad y seguridad > Cookies",
      "Safari: Preferencias > Privacidad > Cookies",
      "Edge: Configuración > Cookies y permisos del sitio"
    ]
  },
  {
    icon: Shield,
    title: "Herramientas de Terceros",
    description: "Utilizamos herramientas de terceros que pueden establecer cookies adicionales.",
    tools: [
      "Google Analytics para análisis web",
      "Stripe para procesamiento de pagos",
      "Firebase para autenticación",
      "Cloudflare para seguridad"
    ]
  }
];

export default function CookiesPage() {
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
              Política de Cookies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Utilizamos cookies para mejorar tu experiencia en Rubi. Esta política explica qué cookies usamos y cómo puedes gestionarlas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.div>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Tipos de Cookies</h2>
              <p className="text-xl text-gray-400">Descubre qué cookies utilizamos y por qué</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {cookieTypes.map((cookie, index) => (
                <motion.div
                  key={cookie.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-600">
                      <cookie.icon className="w-8 h-8 text-gray-300" />
                    </div>
                    {cookie.required && (
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                        Requerida
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{cookie.title}</h3>
                  <p className="text-gray-400 mb-4">{cookie.description}</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Duración: {cookie.duration}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Ejemplos:</h4>
                    <ul className="space-y-1">
                      {cookie.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-sm text-gray-400 flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cookie Management */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Gestión de Cookies</h2>
              <p className="text-xl text-gray-400">Cómo puedes controlar las cookies en tu navegador</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {cookieManagement.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <item.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-400 mb-6">{item.description}</p>
                  
                  {item.steps && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Pasos:</h4>
                      <ul className="space-y-2">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-gray-400 flex items-start">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.tools && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Herramientas:</h4>
                      <ul className="space-y-2">
                        {item.tools.map((tool, toolIndex) => (
                          <li key={toolIndex} className="text-sm text-gray-400 flex items-start">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Información Adicional</h2>
              <p className="text-xl text-gray-400">Más detalles sobre nuestro uso de cookies</p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Cookies de Terceros</h3>
                <p className="text-gray-400 mb-4">
                  Algunos servicios de terceros pueden establecer cookies cuando visitas nuestro sitio. Estos servicios incluyen:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Google Analytics:</strong> Para análisis de tráfico web</li>
                  <li>• <strong>Stripe:</strong> Para procesamiento seguro de pagos</li>
                  <li>• <strong>Firebase:</strong> Para autenticación y base de datos</li>
                  <li>• <strong>Cloudflare:</strong> Para seguridad y rendimiento</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Actualizaciones de la Política</h3>
                <p className="text-gray-400 mb-4">
                  Podemos actualizar esta política de cookies ocasionalmente. Te notificaremos de cualquier cambio significativo.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Notificaciones por email para cambios importantes</li>
                  <li>• Banner en el sitio web para actualizaciones menores</li>
                  <li>• Fecha de última actualización visible en esta página</li>
                  <li>• Historial de cambios disponible bajo solicitud</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Contacto</h3>
                <p className="text-gray-400 mb-4">
                  Si tienes preguntas sobre nuestra política de cookies, no dudes en contactarnos.
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>Email: privacy@rubi.ai</p>
                  <p>Asunto: Consulta sobre cookies</p>
                  <p>Respuesta: En menos de 48 horas</p>
                </div>
              </motion.div>
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
              <h2 className="text-4xl font-bold text-white mb-6">¿Tienes preguntas?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Nuestro equipo está aquí para ayudarte con cualquier consulta sobre cookies
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Contactar soporte
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
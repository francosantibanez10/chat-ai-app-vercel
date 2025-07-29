"use client";

import { motion } from "framer-motion";
import { Crown, FileText, Shield, Users, Calendar, AlertTriangle } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const termsSections = [
  {
    icon: FileText,
    title: "Aceptación de Términos",
    content: [
      "Al usar Rubi, aceptas estos términos de servicio",
      "Debes tener al menos 13 años para usar el servicio",
      "Eres responsable de mantener la confidencialidad de tu cuenta",
      "No puedes transferir tu cuenta a otra persona",
      "Debes notificar inmediatamente cualquier uso no autorizado"
    ]
  },
  {
    icon: Shield,
    title: "Uso Aceptable",
    content: [
      "Usar el servicio solo para fines legales y legítimos",
      "No generar contenido ilegal, dañino o ofensivo",
      "No intentar acceder a sistemas o datos no autorizados",
      "No usar el servicio para spam o actividades comerciales no autorizadas",
      "Respetar los derechos de propiedad intelectual"
    ]
  },
  {
    icon: Users,
    title: "Cuentas de Usuario",
    content: [
      "Proporcionar información precisa y actualizada",
      "Mantener la seguridad de tu contraseña",
      "No compartir credenciales de acceso",
      "Una cuenta por persona, no cuentas múltiples",
      "Podemos suspender cuentas que violen estos términos"
    ]
  },
  {
    icon: AlertTriangle,
    title: "Limitaciones de Responsabilidad",
    content: [
      "El servicio se proporciona 'tal como está'",
      "No garantizamos disponibilidad 24/7",
      "No somos responsables por pérdida de datos",
      "Limitación de responsabilidad según la ley aplicable",
      "Indemnización por uso indebido del servicio"
    ]
  },
  {
    icon: Calendar,
    title: "Facturación y Pagos",
    content: [
      "Los precios están sujetos a cambios con 30 días de aviso",
      "Facturación automática para planes de pago",
      "Reembolsos según nuestra política de reembolso",
      "Impuestos aplicables según tu jurisdicción",
      "Cancelación disponible en cualquier momento"
    ]
  },
  {
    icon: FileText,
    title: "Propiedad Intelectual",
    content: [
      "Rubi conserva todos los derechos sobre el software",
      "Los usuarios conservan derechos sobre su contenido",
      "Licencia limitada para usar el servicio",
      "No se permite ingeniería inversa",
      "Marcas comerciales protegidas por ley"
    ]
  }
];

export default function TermsPage() {
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
              Términos de Servicio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Estos términos rigen el uso de Rubi. Al usar nuestro servicio, aceptas estos términos y condiciones.
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

        {/* Terms Sections */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {termsSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <section.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Información Legal</h2>
              <p className="text-xl text-gray-400">Detalles adicionales sobre nuestros términos</p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Terminación del Servicio</h3>
                <p className="text-gray-400 mb-4">
                  Podemos terminar o suspender tu acceso al servicio en cualquier momento, con o sin causa, con o sin previo aviso.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Violación de estos términos de servicio</li>
                  <li>• Uso fraudulento o abusivo del servicio</li>
                  <li>• No pago de tarifas aplicables</li>
                  <li>• Cese de operaciones comerciales</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Ley Aplicable</h3>
                <p className="text-gray-400 mb-4">
                  Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá en los tribunales de Madrid.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Jurisdicción: Madrid, España</li>
                  <li>• Ley aplicable: Legislación española</li>
                  <li>• Resolución de disputas: Mediación o arbitraje</li>
                  <li>• Separabilidad: Cláusulas independientes</li>
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
                  Si tienes preguntas sobre estos términos de servicio, no dudes en contactarnos.
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>Email: legal@rubi.ai</p>
                  <p>Dirección: Madrid, España</p>
                  <p>Teléfono: +34 900 123 456</p>
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
                Nuestro equipo legal está aquí para ayudarte con cualquier consulta sobre nuestros términos
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Contactar soporte legal
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
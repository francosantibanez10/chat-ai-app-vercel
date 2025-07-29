"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Calendar,
} from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const privacySections = [
  {
    icon: Database,
    title: "Información que recopilamos",
    content: [
      "Información de cuenta (nombre, email, contraseña)",
      "Datos de uso y análisis de la aplicación",
      "Archivos y documentos que subes para análisis",
      "Conversaciones y mensajes con la IA",
      "Información técnica del dispositivo y navegador",
    ],
  },
  {
    icon: Shield,
    title: "Cómo usamos tu información",
    content: [
      "Proporcionar y mejorar nuestros servicios de IA",
      "Personalizar tu experiencia de usuario",
      "Comunicarnos contigo sobre tu cuenta",
      "Detectar y prevenir fraudes o abusos",
      "Cumplir con obligaciones legales",
    ],
  },
  {
    icon: Lock,
    title: "Protección de datos",
    content: [
      "Encriptación de extremo a extremo para todos los datos",
      "Almacenamiento seguro en servidores certificados",
      "Acceso restringido solo a personal autorizado",
      "Auditorías regulares de seguridad",
      "Cumplimiento con GDPR y otras regulaciones",
    ],
  },
  {
    icon: Users,
    title: "Compartir información",
    content: [
      "No vendemos, alquilamos ni compartimos datos personales",
      "Solo compartimos datos con tu consentimiento explícito",
      "Podemos compartir datos anónimos para análisis",
      "Cumplimiento con órdenes legales cuando sea necesario",
      "Colaboración con proveedores de servicios confiables",
    ],
  },
  {
    icon: Eye,
    title: "Tus derechos",
    content: [
      "Acceder a tus datos personales",
      "Corregir información inexacta",
      "Solicitar la eliminación de tus datos",
      "Portabilidad de datos",
      "Oponerte al procesamiento de datos",
      "Retirar consentimiento en cualquier momento",
    ],
  },
  {
    icon: Calendar,
    title: "Retención de datos",
    content: [
      "Mantenemos datos mientras tu cuenta esté activa",
      "Datos eliminados 30 días después de cancelar cuenta",
      "Algunos datos pueden retenerse por obligaciones legales",
      "Datos anónimos pueden conservarse para análisis",
      "Backups eliminados en 90 días",
    ],
  },
];

export default function PrivacyPage() {
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
              Política de Privacidad
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Tu privacidad es fundamental para nosotros. Esta política explica
              cómo recopilamos, usamos y protegemos tu información.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </motion.div>
          </div>
        </section>

        {/* Privacy Sections */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {privacySections.map((section, index) => (
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
                  <h3 className="text-xl font-bold text-white mb-6">
                    {section.title}
                  </h3>
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
              <h2 className="text-4xl font-bold text-white mb-6">
                Información Adicional
              </h2>
              <p className="text-xl text-gray-400">
                Más detalles sobre cómo protegemos tu privacidad
              </p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Cookies y Tecnologías Similares
                </h3>
                <p className="text-gray-400 mb-4">
                  Utilizamos cookies y tecnologías similares para mejorar tu
                  experiencia, analizar el uso del sitio y personalizar
                  contenido.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Cookies esenciales para el funcionamiento del sitio</li>
                  <li>• Cookies de análisis para mejorar nuestros servicios</li>
                  <li>
                    • Cookies de preferencias para personalizar tu experiencia
                  </li>
                  <li>
                    • Puedes gestionar las cookies en la configuración de tu
                    navegador
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Transferencias Internacionales
                </h3>
                <p className="text-gray-400 mb-4">
                  Tus datos pueden ser transferidos y procesados en países fuera
                  de tu residencia. Garantizamos que estas transferencias
                  cumplen con las leyes de protección de datos aplicables.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Transferencias a países con adecuación de la UE</li>
                  <li>
                    • Garantías contractuales estándar cuando sea necesario
                  </li>
                  <li>• Cumplimiento con GDPR para usuarios de la UE</li>
                  <li>
                    • Protecciones equivalentes para usuarios de otros países
                  </li>
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
                  Si tienes preguntas sobre esta política de privacidad o sobre
                  cómo manejamos tus datos, no dudes en contactarnos.
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>Email: privacy@rubi.ai</p>
                  <p>Dirección: Madrid, España</p>
                  <p>Responsable de Protección de Datos: dpo@rubi.ai</p>
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
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Tienes preguntas?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Nuestro equipo está aquí para ayudarte con cualquier consulta
                sobre privacidad
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

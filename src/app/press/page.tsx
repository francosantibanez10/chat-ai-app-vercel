"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Calendar,
  ExternalLink,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const pressReleases = [
  {
    id: 1,
    title:
      "Rubi anuncia Serie A de $5M para escalar plataforma de IA conversacional",
    date: "2024-03-15",
    summary:
      "La startup española Rubi ha cerrado una ronda de financiación de $5 millones para expandir su plataforma de inteligencia artificial conversacional.",
    category: "Financiación",
  },
  {
    id: 2,
    title: "Rubi lanza nueva funcionalidad de análisis de documentos con IA",
    date: "2024-02-28",
    summary:
      "La plataforma de IA conversacional Rubi ha introducido capacidades avanzadas de análisis de documentos, permitiendo a los usuarios procesar y entender archivos complejos.",
    category: "Producto",
  },
  {
    id: 3,
    title: "Rubi alcanza 50,000 usuarios activos en solo 6 meses",
    date: "2024-01-20",
    summary:
      "La startup de IA Rubi celebra un hito importante al alcanzar 50,000 usuarios activos, demostrando la creciente demanda de herramientas de IA accesibles.",
    category: "Crecimiento",
  },
  {
    id: 4,
    title: "Rubi nombra a María García como nueva CEO",
    date: "2023-12-10",
    summary:
      "La junta directiva de Rubi ha nombrado a María García como nueva CEO, trayendo más de 10 años de experiencia en el sector de la inteligencia artificial.",
    category: "Equipo",
  },
];

const mediaKit = {
  logo: {
    title: "Logo de Rubi",
    description: "Logo oficial en diferentes formatos y colores",
    formats: ["SVG", "PNG", "JPG"],
  },
  screenshots: {
    title: "Capturas de pantalla",
    description: "Imágenes de la plataforma en diferentes dispositivos",
    formats: ["PNG", "JPG"],
  },
  brandGuidelines: {
    title: "Guía de marca",
    description: "Documento completo con las directrices de marca",
    formats: ["PDF"],
  },
};

const contactInfo = {
  pressEmail: "press@rubi.ai",
  generalEmail: "contact@rubi.ai",
  phone: "+34 900 123 456",
  address: "Madrid, España",
};

export default function PressPage() {
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
              Sala de Prensa
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Recursos para periodistas, comunicados de prensa y información de
              contacto para medios.
            </motion.p>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Comunicados de Prensa
              </h2>
              <p className="text-xl text-gray-400">
                Últimas noticias y anuncios oficiales
              </p>
            </motion.div>

            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                          {release.category}
                        </span>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(release.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {release.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {release.summary}
                      </p>
                    </div>
                    <div className="mt-6 lg:mt-0 lg:ml-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Leer más
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Kit de Medios
              </h2>
              <p className="text-xl text-gray-400">
                Recursos para periodistas y medios de comunicación
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {Object.entries(mediaKit).map(([key, item], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                    <Download className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 mb-6">{item.description}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {item.formats.map((format, formatIndex) => (
                      <span
                        key={formatIndex}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700"
                  >
                    Descargar
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Información de la Empresa
              </h2>
              <p className="text-xl text-gray-400">Datos clave sobre Rubi</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Datos Básicos
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Fundada:</span>
                    <p className="text-white font-semibold">2023</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Sede:</span>
                    <p className="text-white font-semibold">Madrid, España</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Empleados:</span>
                    <p className="text-white font-semibold">25+</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Usuarios activos:</span>
                    <p className="text-white font-semibold">50,000+</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Financiación:</span>
                    <p className="text-white font-semibold">$5M Serie A</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Contacto de Prensa
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Email de prensa</p>
                      <p className="text-white font-semibold">
                        {contactInfo.pressEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Email general</p>
                      <p className="text-white font-semibold">
                        {contactInfo.generalEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Teléfono</p>
                      <p className="text-white font-semibold">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Dirección</p>
                      <p className="text-white font-semibold">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
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
                ¿Necesitas más información?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Nuestro equipo de comunicación está disponible para entrevistas
                y consultas
              </p>
              <motion.a
                href={`mailto:${contactInfo.pressEmail}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Contactar prensa
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

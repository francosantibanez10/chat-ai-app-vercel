"use client";

import { motion } from "framer-motion";
import { Crown, Play, Clock, Users, BookOpen, Zap, Star } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const tutorials = [
  {
    id: 1,
    title: "Primeros pasos con Rubi",
    description: "Aprende los conceptos básicos y cómo empezar a usar la plataforma",
    duration: "15 min",
    level: "Principiante",
    views: "2.5K",
    rating: 4.8,
    thumbnail: "/api/placeholder/400/250",
    category: "Básico"
  },
  {
    id: 2,
    title: "Análisis avanzado de documentos",
    description: "Descubre cómo extraer información clave de PDFs, imágenes y archivos",
    duration: "25 min",
    level: "Intermedio",
    views: "1.8K",
    rating: 4.9,
    thumbnail: "/api/placeholder/400/250",
    category: "Documentos"
  },
  {
    id: 3,
    title: "Integración con APIs",
    description: "Conecta Rubi con tus aplicaciones favoritas usando nuestra API",
    duration: "35 min",
    level: "Avanzado",
    views: "1.2K",
    rating: 4.7,
    thumbnail: "/api/placeholder/400/250",
    category: "Desarrollo"
  },
  {
    id: 4,
    title: "Optimización de prompts",
    description: "Mejora tus resultados con técnicas avanzadas de prompt engineering",
    duration: "20 min",
    level: "Intermedio",
    views: "3.1K",
    rating: 4.9,
    thumbnail: "/api/placeholder/400/250",
    category: "IA"
  },
  {
    id: 5,
    title: "Automatización de flujos de trabajo",
    description: "Crea flujos automatizados para tareas repetitivas",
    duration: "30 min",
    level: "Avanzado",
    views: "950",
    rating: 4.6,
    thumbnail: "/api/placeholder/400/250",
    category: "Automatización"
  },
  {
    id: 6,
    title: "Seguridad y privacidad",
    description: "Mejores prácticas para mantener tus datos seguros",
    duration: "18 min",
    level: "Principiante",
    views: "1.5K",
    rating: 4.8,
    thumbnail: "/api/placeholder/400/250",
    category: "Seguridad"
  }
];

const categories = [
  { name: "Todos", count: tutorials.length },
  { name: "Básico", count: tutorials.filter(t => t.category === "Básico").length },
  { name: "Documentos", count: tutorials.filter(t => t.category === "Documentos").length },
  { name: "Desarrollo", count: tutorials.filter(t => t.category === "Desarrollo").length },
  { name: "IA", count: tutorials.filter(t => t.category === "IA").length },
  { name: "Automatización", count: tutorials.filter(t => t.category === "Automatización").length },
  { name: "Seguridad", count: tutorials.filter(t => t.category === "Seguridad").length }
];

export default function TutorialsPage() {
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
              Tutoriales
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Aprende a aprovechar al máximo Rubi con nuestros tutoriales paso a paso, desde conceptos básicos hasta técnicas avanzadas.
            </motion.p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600"
                >
                  {category.name} ({category.count})
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Tutorials Grid */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutorials.map((tutorial, index) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {tutorial.duration}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                        {tutorial.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                        {tutorial.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">{tutorial.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{tutorial.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {tutorial.views}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {tutorial.rating}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 border border-gray-700"
                      >
                        Ver tutorial
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Ruta de Aprendizaje</h2>
              <p className="text-xl text-gray-400">Sigue esta ruta recomendada para dominar Rubi</p>
            </motion.div>

            <div className="space-y-8">
              {[
                { step: 1, title: "Fundamentos", description: "Aprende los conceptos básicos y configura tu cuenta" },
                { step: 2, title: "Análisis de Documentos", description: "Procesa y extrae información de archivos" },
                { step: 3, title: "Optimización", description: "Mejora tus resultados con técnicas avanzadas" },
                { step: 4, title: "Automatización", description: "Crea flujos de trabajo automatizados" }
              ].map((path, index) => (
                <motion.div
                  key={path.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex items-center gap-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                    <span className="text-2xl font-bold text-white">{path.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
                    <p className="text-gray-400">{path.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="w-px h-16 bg-gray-700 mx-8"></div>
                  )}
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
              <h2 className="text-4xl font-bold text-white mb-6">¿Necesitas ayuda personalizada?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Nuestro equipo de soporte está aquí para ayudarte con cualquier consulta
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
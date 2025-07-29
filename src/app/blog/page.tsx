"use client";

import { motion } from "framer-motion";
import { Crown, Calendar, User, Clock, Tag, ArrowRight } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const blogPosts = [
  {
    id: 1,
    title: "El futuro de la IA conversacional en 2024",
    excerpt: "Descubre las tendencias más importantes que están moldeando el futuro de la inteligencia artificial conversacional y cómo Rubi está liderando esta revolución.",
    author: "María García",
    date: "2024-03-20",
    readTime: "8 min",
    category: "Tendencias",
    featured: true,
    image: "/api/placeholder/600/400"
  },
  {
    id: 2,
    title: "Cómo las empresas están usando IA para mejorar la productividad",
    excerpt: "Casos de estudio reales de empresas que han implementado soluciones de IA y han visto mejoras significativas en su productividad y eficiencia.",
    author: "Carlos Rodríguez",
    date: "2024-03-15",
    readTime: "12 min",
    category: "Casos de Estudio",
    featured: false,
    image: "/api/placeholder/600/400"
  },
  {
    id: 3,
    title: "Guía completa de prompt engineering",
    excerpt: "Aprende las mejores técnicas para escribir prompts efectivos que te ayuden a obtener resultados más precisos y útiles de la IA.",
    author: "Ana Martínez",
    date: "2024-03-10",
    readTime: "15 min",
    category: "Guías",
    featured: false,
    image: "/api/placeholder/600/400"
  },
  {
    id: 4,
    title: "Seguridad y privacidad en la era de la IA",
    excerpt: "Exploramos los desafíos de seguridad y privacidad que plantea la IA y cómo Rubi aborda estos temas críticos.",
    author: "David López",
    date: "2024-03-05",
    readTime: "10 min",
    category: "Seguridad",
    featured: false,
    image: "/api/placeholder/600/400"
  },
  {
    id: 5,
    title: "Integrando IA en flujos de trabajo existentes",
    excerpt: "Descubre estrategias prácticas para integrar la IA en tus procesos de trabajo actuales sin interrumpir la operación.",
    author: "María García",
    date: "2024-02-28",
    readTime: "11 min",
    category: "Integración",
    featured: false,
    image: "/api/placeholder/600/400"
  },
  {
    id: 6,
    title: "El impacto de la IA en diferentes industrias",
    excerpt: "Un análisis profundo de cómo la inteligencia artificial está transformando sectores como la salud, finanzas, educación y más.",
    author: "Carlos Rodríguez",
    date: "2024-02-20",
    readTime: "14 min",
    category: "Análisis",
    featured: false,
    image: "/api/placeholder/600/400"
  }
];

const categories = [
  { name: "Todos", count: blogPosts.length },
  { name: "Tendencias", count: blogPosts.filter(p => p.category === "Tendencias").length },
  { name: "Casos de Estudio", count: blogPosts.filter(p => p.category === "Casos de Estudio").length },
  { name: "Guías", count: blogPosts.filter(p => p.category === "Guías").length },
  { name: "Seguridad", count: blogPosts.filter(p => p.category === "Seguridad").length },
  { name: "Integración", count: blogPosts.filter(p => p.category === "Integración").length },
  { name: "Análisis", count: blogPosts.filter(p => p.category === "Análisis").length }
];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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
              Blog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Descubre las últimas tendencias, casos de estudio y guías sobre inteligencia artificial y cómo Rubi está transformando el futuro.
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

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-20 px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Artículo Destacado</h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl overflow-hidden border border-gray-700/50"
              >
                <div className="grid lg:grid-cols-2">
                  <div className="h-64 lg:h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Imagen del artículo</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{featuredPost.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <User className="w-4 h-4 mr-2" />
                        {featuredPost.author}
                        <span className="mx-2">•</span>
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(featuredPost.date).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700 flex items-center"
                      >
                        Leer más
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Últimos Artículos</h2>
              <p className="text-xl text-gray-400">Explora nuestro contenido más reciente</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Imagen del artículo</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                        {post.category}
                      </span>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-xs">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 border border-gray-700 text-sm"
                      >
                        Leer
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Mantente Actualizado</h2>
              <p className="text-xl text-gray-400 mb-8">
                Suscríbete a nuestro newsletter para recibir las últimas noticias y artículos sobre IA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700"
                >
                  Suscribirse
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
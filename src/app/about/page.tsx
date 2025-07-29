"use client";

import { motion } from "framer-motion";
import { Crown, Users, Target, Zap, Globe, Heart, Award, TrendingUp, Shield } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const teamMembers = [
  {
    name: "María García",
    role: "CEO & Fundadora",
    description: "Experta en IA con 10+ años en Silicon Valley",
    image: "/api/placeholder/150/150"
  },
  {
    name: "Carlos Rodríguez",
    role: "CTO",
    description: "Ingeniero senior especializado en machine learning",
    image: "/api/placeholder/150/150"
  },
  {
    name: "Ana Martínez",
    role: "Directora de Producto",
    description: "Product manager con experiencia en startups de IA",
    image: "/api/placeholder/150/150"
  },
  {
    name: "David López",
    role: "Director de Diseño",
    description: "Diseñador UX/UI con enfoque en experiencias de IA",
    image: "/api/placeholder/150/150"
  }
];

const milestones = [
  {
    year: "2023",
    title: "Fundación",
    description: "Rubi nace con la misión de democratizar la IA"
  },
  {
    year: "2024",
    title: "Lanzamiento Beta",
    description: "Primera versión con 1,000 usuarios activos"
  },
  {
    year: "2024",
    title: "Serie A",
    description: "$5M en financiación para escalar la plataforma"
  },
  {
    year: "2025",
    title: "Expansión Global",
    description: "Disponible en 50+ países con 100K+ usuarios"
  }
];

const values = [
  {
    icon: Heart,
    title: "Innovación",
    description: "Siempre explorando nuevas formas de hacer la IA más accesible y útil"
  },
  {
    icon: Users,
    title: "Comunidad",
    description: "Construyendo una comunidad global de usuarios y desarrolladores"
  },
  {
    icon: Shield,
    title: "Privacidad",
    description: "La privacidad y seguridad de nuestros usuarios es nuestra prioridad"
  },
  {
    icon: Globe,
    title: "Impacto",
    description: "Usando la IA para resolver problemas reales y mejorar vidas"
  }
];

export default function AboutPage() {
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
              Acerca de Rubi
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Somos un equipo apasionado por la IA, trabajando para hacer la inteligencia artificial más accesible, útil y segura para todos.
            </motion.p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                  <Target className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">Nuestra Misión</h2>
                <p className="text-gray-400 leading-relaxed">
                  Democratizar el acceso a la inteligencia artificial, proporcionando herramientas poderosas y fáciles de usar que empoderen a individuos y empresas para resolver problemas complejos de manera más eficiente.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                  <Zap className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">Nuestra Visión</h2>
                <p className="text-gray-400 leading-relaxed">
                  Ser la plataforma líder en IA conversacional, donde millones de personas puedan interactuar con la inteligencia artificial de forma natural, segura y productiva, transformando la manera en que trabajamos y vivimos.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Nuestros Valores</h2>
              <p className="text-xl text-gray-400">Los principios que guían todo lo que hacemos</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                    <value.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Nuestro Equipo</h2>
              <p className="text-xl text-gray-400">Conoce a las personas detrás de Rubi</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full mx-auto mb-6 border border-gray-600 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-gray-300 mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Nuestro Viaje</h2>
              <p className="text-xl text-gray-400">Hitos importantes en nuestra historia</p>
            </motion.div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col gap-8`}
                >
                  <div className="flex-1">
                    <div className="glass-effect rounded-2xl p-8 border border-gray-700/50">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl font-bold text-white mr-4">{milestone.year}</span>
                        <Award className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{milestone.title}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                    <TrendingUp className="w-8 h-8 text-gray-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Números que Importan</h2>
              <p className="text-xl text-gray-400">El impacto que estamos teniendo</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <p className="text-gray-400">Usuarios activos</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">1M+</div>
                <p className="text-gray-400">Conversaciones procesadas</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <p className="text-gray-400">Tiempo de actividad</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <p className="text-gray-400">Soporte disponible</p>
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
              <h2 className="text-4xl font-bold text-white mb-6">¿Quieres unirte a nuestro equipo?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Estamos siempre buscando talento apasionado por la IA
              </p>
              <motion.a
                href="/careers"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Ver oportunidades
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
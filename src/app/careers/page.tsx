"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users, MapPin, Clock, DollarSign, Zap, Heart, Globe, Briefcase, Send } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const jobOpenings = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Madrid, España (Remoto)",
    type: "Tiempo completo",
    salary: "€60,000 - €80,000",
    description: "Buscamos un desarrollador frontend senior para construir interfaces de usuario excepcionales para nuestra plataforma de IA.",
    requirements: [
      "5+ años de experiencia con React/Next.js",
      "Experiencia con TypeScript y Tailwind CSS",
      "Conocimientos de animaciones y UX",
      "Experiencia con APIs REST y GraphQL"
    ],
    benefits: [
      "Salario competitivo y equity",
      "Horario flexible y trabajo remoto",
      "Seguro médico privado",
      "Desarrollo profesional continuo"
    ]
  },
  {
    id: 2,
    title: "Machine Learning Engineer",
    department: "AI/ML",
    location: "Madrid, España (Híbrido)",
    type: "Tiempo completo",
    salary: "€70,000 - €90,000",
    description: "Únete a nuestro equipo de IA para desarrollar y optimizar modelos de machine learning para procesamiento de lenguaje natural.",
    requirements: [
      "3+ años de experiencia en ML/AI",
      "Experiencia con Python, TensorFlow/PyTorch",
      "Conocimientos de NLP y LLMs",
      "Experiencia con APIs de OpenAI"
    ],
    benefits: [
      "Salario competitivo y equity",
      "Acceso a recursos de IA de vanguardia",
      "Conferencias y formación",
      "Horario flexible"
    ]
  },
  {
    id: 3,
    title: "Product Manager",
    department: "Product",
    location: "Madrid, España (Remoto)",
    type: "Tiempo completo",
    salary: "€65,000 - €85,000",
    description: "Lidera el desarrollo de productos de IA que transformen la experiencia del usuario y generen valor real.",
    requirements: [
      "3+ años de experiencia en gestión de productos",
      "Experiencia con productos SaaS",
      "Conocimientos básicos de IA/ML",
      "Excelentes habilidades de comunicación"
    ],
    benefits: [
      "Salario competitivo y equity",
      "Impacto directo en el producto",
      "Trabajo con tecnologías de vanguardia",
      "Crecimiento profesional rápido"
    ]
  },
  {
    id: 4,
    title: "UX/UI Designer",
    department: "Design",
    location: "Madrid, España (Remoto)",
    type: "Tiempo completo",
    salary: "€50,000 - €70,000",
    description: "Diseña experiencias de usuario excepcionales para nuestra plataforma de IA conversacional.",
    requirements: [
      "3+ años de experiencia en diseño UX/UI",
      "Experiencia con Figma y herramientas de diseño",
      "Portfolio de proyectos digitales",
      "Conocimientos de diseño de IA/chatbots"
    ],
    benefits: [
      "Salario competitivo y equity",
      "Libertad creativa total",
      "Trabajo con tecnologías emergentes",
      "Formación continua en diseño"
    ]
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Cultura Inclusiva",
    description: "Diversidad, equidad e inclusión en el centro de todo lo que hacemos"
  },
  {
    icon: Globe,
    title: "Trabajo Remoto",
    description: "Flexibilidad para trabajar desde donde quieras"
  },
  {
    icon: Zap,
    title: "Tecnología de Vanguardia",
    description: "Acceso a las últimas herramientas y tecnologías de IA"
  },
  {
    icon: Users,
    title: "Equipo Apasionado",
    description: "Trabaja con personas que comparten tu pasión por la IA"
  }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (jobId: number) => {
    setIsApplying(true);
    // Simular proceso de aplicación
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsApplying(false);
    setSelectedJob(null);
    // Aquí se podría abrir un modal o redirigir a un formulario
  };

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
              Únete a Nuestro Equipo
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Ayúdanos a construir el futuro de la IA. Buscamos personas apasionadas que quieran hacer un impacto real en el mundo.
            </motion.p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Por Qué Trabajar en Rubi</h2>
              <p className="text-xl text-gray-400">Descubre lo que hace especial trabajar con nosotros</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                    <benefit.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Oportunidades Abiertas</h2>
              <p className="text-xl text-gray-400">Encuentra el puesto perfecto para ti</p>
            </motion.div>

            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {job.salary}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="mt-4 lg:mt-0 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700"
                    >
                      {selectedJob === job.id ? 'Ocultar detalles' : 'Ver detalles'}
                    </motion.button>
                  </div>

                  {selectedJob === job.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-700 pt-6"
                    >
                      <p className="text-gray-300 mb-6">{job.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Requisitos</h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-300 text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Beneficios</h4>
                          <ul className="space-y-2">
                            {job.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-300 text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApply(job.id)}
                          disabled={isApplying}
                          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isApplying ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Aplicar ahora</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Proceso de Aplicación</h2>
              <p className="text-xl text-gray-400">Cómo funciona nuestro proceso de contratación</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Aplicación</h3>
                <p className="text-gray-400">Envía tu CV y carta de presentación</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Entrevista</h3>
                <p className="text-gray-400">Conversación inicial con el equipo</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Prueba Técnica</h3>
                <p className="text-gray-400">Evaluación práctica de habilidades</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Oferta</h3>
                <p className="text-gray-400">¡Bienvenido al equipo!</p>
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
              <h2 className="text-4xl font-bold text-white mb-6">¿No ves el puesto perfecto?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Siempre estamos buscando talento excepcional. Envíanos tu CV y te contactaremos cuando tengamos una oportunidad.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Enviar CV espontáneo
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
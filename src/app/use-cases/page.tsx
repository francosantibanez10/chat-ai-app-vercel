"use client";

import { motion } from "framer-motion";
import { Crown, Building, Users, FileText, MessageSquare, Zap, TrendingUp, CheckCircle } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const useCases = [
  {
    id: 1,
    title: "Análisis de Documentos",
    description: "Procesa y extrae información clave de PDFs, contratos, facturas y reportes",
    icon: FileText,
    industry: "Legal, Finanzas, Recursos Humanos",
    benefits: [
      "Reducción del 80% en tiempo de revisión",
      "Extracción automática de datos clave",
      "Búsqueda inteligente en documentos",
      "Análisis de sentimientos en textos"
    ],
    examples: [
      "Revisión automática de contratos legales",
      "Procesamiento de facturas y recibos",
      "Análisis de CVs y perfiles de candidatos",
      "Extracción de datos de reportes financieros"
    ]
  },
  {
    id: 2,
    title: "Atención al Cliente",
    description: "Automatiza respuestas y mejora la experiencia del cliente con IA conversacional",
    icon: MessageSquare,
    industry: "E-commerce, Servicios, SaaS",
    benefits: [
      "Respuestas instantáneas 24/7",
      "Reducción del 70% en tickets de soporte",
      "Personalización basada en historial",
      "Escalabilidad automática"
    ],
    examples: [
      "Chatbots inteligentes para e-commerce",
      "Soporte técnico automatizado",
      "Reservas y citas automáticas",
      "Análisis de feedback de clientes"
    ]
  },
  {
    id: 3,
    title: "Investigación y Análisis",
    description: "Accelera la investigación con análisis inteligente de grandes volúmenes de datos",
    icon: TrendingUp,
    industry: "Investigación, Consultoría, Académico",
    benefits: [
      "Análisis de tendencias en tiempo real",
      "Síntesis automática de información",
      "Identificación de patrones ocultos",
      "Generación de insights accionables"
    ],
    examples: [
      "Análisis de mercado y competencia",
      "Investigación académica automatizada",
      "Monitoreo de redes sociales",
      "Análisis de sentimientos de marca"
    ]
  },
  {
    id: 4,
    title: "Automatización de Procesos",
    description: "Optimiza flujos de trabajo y elimina tareas repetitivas",
    icon: Zap,
    industry: "Manufactura, Logística, Operaciones",
    benefits: [
      "Reducción del 90% en tareas manuales",
      "Mejora en precisión y consistencia",
      "Escalabilidad sin límites",
      "ROI positivo en 3 meses"
    ],
    examples: [
      "Procesamiento automático de órdenes",
      "Gestión de inventario inteligente",
      "Automatización de reportes",
      "Flujos de aprobación automáticos"
    ]
  },
  {
    id: 5,
    title: "Educación y Capacitación",
    description: "Revoluciona el aprendizaje con IA personalizada y contenido adaptativo",
    icon: Users,
    industry: "Educación, Corporativo, E-learning",
    benefits: [
      "Aprendizaje personalizado",
      "Evaluación automática",
      "Contenido adaptativo",
      "Seguimiento de progreso"
    ],
    examples: [
      "Tutores virtuales personalizados",
      "Evaluación automática de tareas",
      "Generación de contenido educativo",
      "Análisis de rendimiento estudiantil"
    ]
  },
  {
    id: 6,
    title: "Desarrollo de Productos",
    description: "Acelera el desarrollo con IA para testing, documentación y análisis de código",
    icon: Building,
    industry: "Tecnología, Software, Startups",
    benefits: [
      "Testing automatizado inteligente",
      "Generación de documentación",
      "Análisis de código y debugging",
      "Optimización de rendimiento"
    ],
    examples: [
      "Testing automatizado de aplicaciones",
      "Generación de documentación técnica",
      "Análisis de código y refactoring",
      "Optimización de queries y algoritmos"
    ]
  }
];

const industries = [
  {
    name: "Finanzas",
    description: "Automatización de procesos financieros y análisis de riesgo",
    icon: TrendingUp
  },
  {
    name: "Salud",
    description: "Análisis de datos médicos y asistencia en diagnósticos",
    icon: Users
  },
  {
    name: "Legal",
    description: "Revisión de contratos y análisis de documentos legales",
    icon: FileText
  },
  {
    name: "Educación",
    description: "Aprendizaje personalizado y evaluación automática",
    icon: Building
  },
  {
    name: "E-commerce",
    description: "Atención al cliente y personalización de experiencias",
    icon: MessageSquare
  },
  {
    name: "Manufactura",
    description: "Optimización de procesos y mantenimiento predictivo",
    icon: Zap
  }
];

export default function UseCasesPage() {
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
              Casos de Uso
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Descubre cómo empresas de diferentes industrias están transformando sus operaciones con la IA de Rubi.
            </motion.p>
          </div>
        </section>

        {/* Industries */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Industrias</h2>
              <p className="text-xl text-gray-400">Soluciones adaptadas para diferentes sectores</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry, index) => (
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                    <industry.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{industry.name}</h3>
                  <p className="text-gray-400">{industry.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Casos de Uso Principales</h2>
              <p className="text-xl text-gray-400">Soluciones probadas que generan resultados reales</p>
            </motion.div>

            <div className="space-y-12">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                        <useCase.icon className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                      <p className="text-gray-400 mb-4">{useCase.description}</p>
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Industrias:</span>
                        <p className="text-gray-300 font-medium">{useCase.industry}</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Beneficios</h4>
                          <ul className="space-y-2">
                            {useCase.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Ejemplos</h4>
                          <ul className="space-y-2">
                            {useCase.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-300 text-sm">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Historias de Éxito</h2>
              <p className="text-xl text-gray-400">Empresas que han transformado sus operaciones con Rubi</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">80%</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Reducción en tiempo de procesamiento</h3>
                <p className="text-gray-400">Empresa legal que automatizó la revisión de contratos</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">70%</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Menos tickets de soporte</h3>
                <p className="text-gray-400">E-commerce que implementó chatbot inteligente</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
                  <span className="text-2xl font-bold text-white">3x</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Más productividad</h3>
                <p className="text-gray-400">Startup que automatizó análisis de datos</p>
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
              <h2 className="text-4xl font-bold text-white mb-6">¿Listo para transformar tu empresa?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Descubre cómo Rubi puede ayudarte a optimizar tus procesos y mejorar la productividad
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Hablar con un experto
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
"use client";

import { motion } from "framer-motion";
import { Crown, Zap, Code, Database, MessageSquare, FileText, Calendar, Users, Settings, ArrowRight } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const integrations = [
  {
    category: "Productividad",
    icon: Zap,
    integrations: [
      {
        name: "Slack",
        description: "Integra Rubi directamente en tus canales de Slack",
        status: "Disponible",
        features: ["Chat en tiempo real", "Comandos personalizados", "Notificaciones automáticas"]
      },
      {
        name: "Microsoft Teams",
        description: "Usa Rubi dentro de Microsoft Teams",
        status: "Disponible",
        features: ["Bots personalizados", "Integración con SharePoint", "Autenticación SSO"]
      },
      {
        name: "Discord",
        description: "Conecta Rubi con tu servidor de Discord",
        status: "Beta",
        features: ["Comandos de servidor", "Roles y permisos", "Logs automáticos"]
      }
    ]
  },
  {
    category: "Almacenamiento",
    icon: Database,
    integrations: [
      {
        name: "Google Drive",
        description: "Accede y analiza archivos directamente desde Google Drive",
        status: "Disponible",
        features: ["Sincronización automática", "Búsqueda inteligente", "Compartir documentos"]
      },
      {
        name: "Dropbox",
        description: "Integra Rubi con tu cuenta de Dropbox",
        status: "Disponible",
        features: ["Acceso a archivos", "Sincronización en tiempo real", "Permisos granulares"]
      },
      {
        name: "OneDrive",
        description: "Conecta con Microsoft OneDrive",
        status: "Disponible",
        features: ["Integración nativa", "Autenticación Microsoft", "Sincronización automática"]
      }
    ]
  },
  {
    category: "CRM y Ventas",
    icon: Users,
    integrations: [
      {
        name: "Salesforce",
        description: "Automatiza tareas de ventas con IA",
        status: "Disponible",
        features: ["Análisis de leads", "Generación de reportes", "Automatización de emails"]
      },
      {
        name: "HubSpot",
        description: "Optimiza tu marketing con IA",
        status: "Disponible",
        features: ["Análisis de contactos", "Automatización de workflows", "Generación de contenido"]
      },
      {
        name: "Pipedrive",
        description: "Mejora tu pipeline de ventas",
        status: "Beta",
        features: ["Análisis de oportunidades", "Predicciones de ventas", "Automatización de tareas"]
      }
    ]
  },
  {
    category: "Desarrollo",
    icon: Code,
    integrations: [
      {
        name: "GitHub",
        description: "Analiza código y genera documentación automáticamente",
        status: "Disponible",
        features: ["Análisis de código", "Generación de docs", "Code review asistido"]
      },
      {
        name: "GitLab",
        description: "Integra IA en tu pipeline de desarrollo",
        status: "Disponible",
        features: ["CI/CD inteligente", "Análisis de seguridad", "Documentación automática"]
      },
      {
        name: "Jira",
        description: "Automatiza la gestión de proyectos",
        status: "Beta",
        features: ["Generación de tickets", "Análisis de sprints", "Reportes automáticos"]
      }
    ]
  },
  {
    category: "Comunicación",
    icon: MessageSquare,
    integrations: [
      {
        name: "Gmail",
        description: "Analiza y responde emails automáticamente",
        status: "Disponible",
        features: ["Análisis de emails", "Respuestas automáticas", "Clasificación inteligente"]
      },
      {
        name: "Outlook",
        description: "Integra IA con Microsoft Outlook",
        status: "Disponible",
        features: ["Gestión de emails", "Calendario inteligente", "Automatización de tareas"]
      },
      {
        name: "Intercom",
        description: "Mejora la atención al cliente",
        status: "Beta",
        features: ["Chatbots inteligentes", "Análisis de conversaciones", "Respuestas automáticas"]
      }
    ]
  },
  {
    category: "Herramientas de Oficina",
    icon: FileText,
    integrations: [
      {
        name: "Notion",
        description: "Genera y organiza contenido automáticamente",
        status: "Disponible",
        features: ["Generación de contenido", "Organización automática", "Búsqueda inteligente"]
      },
      {
        name: "Airtable",
        description: "Analiza y gestiona bases de datos",
        status: "Disponible",
        features: ["Análisis de datos", "Generación de reportes", "Automatización de workflows"]
      },
      {
        name: "Trello",
        description: "Optimiza la gestión de proyectos",
        status: "Beta",
        features: ["Automatización de tarjetas", "Análisis de proyectos", "Reportes inteligentes"]
      }
    ]
  }
];

const apiFeatures = [
  {
    icon: Code,
    title: "API REST",
    description: "Integra Rubi en tus aplicaciones con nuestra API REST completa",
    features: ["Autenticación OAuth2", "Rate limiting", "Documentación completa", "SDKs disponibles"]
  },
  {
    icon: Zap,
    title: "Webhooks",
    description: "Recibe notificaciones en tiempo real de eventos importantes",
    features: ["Eventos personalizables", "Retry automático", "Filtros avanzados", "Logs detallados"]
  },
  {
    icon: Settings,
    title: "SDKs",
    description: "Librerías oficiales para los lenguajes más populares",
    features: ["JavaScript/TypeScript", "Python", "Java", "C#", "Go", "PHP"]
  }
];

export default function IntegrationsPage() {
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
              Integraciones
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Conecta Rubi con tus herramientas favoritas y automatiza tus flujos de trabajo con más de 50 integraciones disponibles.
            </motion.p>
          </div>
        </section>

        {/* API Features */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">API y Desarrollo</h2>
              <p className="text-xl text-gray-400">Herramientas para desarrolladores</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {apiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <feature.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-300 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations by Category */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Integraciones Disponibles</h2>
              <p className="text-xl text-gray-400">Organizadas por categorías para facilitar tu búsqueda</p>
            </motion.div>

            <div className="space-y-16">
              {integrations.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mr-4 border border-gray-600">
                      <category.icon className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.integrations.map((integration, integrationIndex) => (
                      <motion.div
                        key={integration.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: (categoryIndex * 0.1) + (integrationIndex * 0.05) }}
                        className="glass-effect rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-bold text-white">{integration.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            integration.status === 'Disponible' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {integration.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
                        <ul className="space-y-1">
                          {integration.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-gray-300 text-xs">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4 w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 border border-gray-700 text-sm flex items-center justify-center"
                        >
                          Configurar
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">¿No encuentras tu herramienta?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Estamos constantemente agregando nuevas integraciones. Si necesitas conectar Rubi con una herramienta específica, háznoslo saber.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Solicitar integración
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
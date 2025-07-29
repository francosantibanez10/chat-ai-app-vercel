"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Lock, Eye, Database, Users, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encriptación de Extremo a Extremo",
    description: "Todos los datos están encriptados tanto en tránsito como en reposo",
    details: [
      "Encriptación AES-256 para datos en reposo",
      "TLS 1.3 para datos en tránsito",
      "Claves de encriptación gestionadas por AWS KMS",
      "Rotación automática de claves"
    ]
  },
  {
    icon: Shield,
    title: "Autenticación Segura",
    description: "Múltiples capas de autenticación para proteger tu cuenta",
    details: [
      "Autenticación de dos factores (2FA)",
      "Inicio de sesión con Google OAuth",
      "Verificación por email",
      "Detección de dispositivos sospechosos"
    ]
  },
  {
    icon: Database,
    title: "Almacenamiento Seguro",
    description: "Infraestructura cloud segura con redundancia completa",
    details: [
      "Servidores en centros de datos certificados",
      "Backups automáticos diarios",
      "Redundancia geográfica",
      "Monitoreo 24/7 de la infraestructura"
    ]
  },
  {
    icon: Eye,
    title: "Privacidad de Datos",
    description: "Tus datos nunca se usan para entrenar modelos externos",
    details: [
      "Datos de usuario aislados",
      "Sin acceso de terceros a datos personales",
      "Cumplimiento GDPR y CCPA",
      "Derecho al olvido garantizado"
    ]
  }
];

const complianceStandards = [
  {
    icon: CheckCircle,
    title: "GDPR",
    description: "Cumplimiento completo con el Reglamento General de Protección de Datos de la UE",
    status: "Certificado"
  },
  {
    icon: CheckCircle,
    title: "SOC 2 Type II",
    description: "Auditoría de seguridad, disponibilidad y confidencialidad",
    status: "En proceso"
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Sistema de gestión de seguridad de la información",
    status: "En proceso"
  },
  {
    icon: CheckCircle,
    title: "CCPA",
    description: "Cumplimiento con la Ley de Privacidad del Consumidor de California",
    status: "Certificado"
  }
];

const securityPractices = [
  {
    icon: Zap,
    title: "Desarrollo Seguro",
    description: "Prácticas de desarrollo que priorizan la seguridad",
    practices: [
      "Revisión de código obligatoria",
      "Pruebas de penetración regulares",
      "Análisis estático de código",
      "Gestión de dependencias segura"
    ]
  },
  {
    icon: AlertTriangle,
    title: "Respuesta a Incidentes",
    description: "Proceso rápido y eficiente para manejar incidentes de seguridad",
    practices: [
      "Equipo de respuesta 24/7",
      "Notificación automática de incidentes",
      "Análisis forense completo",
      "Comunicación transparente con usuarios"
    ]
  }
];

export default function SecurityPage() {
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
              Seguridad
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Tu seguridad es nuestra prioridad. Implementamos las mejores prácticas de seguridad para proteger tus datos.
            </motion.p>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Características de Seguridad</h2>
              <p className="text-xl text-gray-400">Múltiples capas de protección para tus datos</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
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
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Estándares de Cumplimiento</h2>
              <p className="text-xl text-gray-400">Certificaciones y cumplimiento con estándares internacionales</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={standard.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-xl p-6 border border-gray-700/50 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-600">
                    <standard.icon className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{standard.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{standard.description}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    standard.status === 'Certificado' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {standard.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Practices */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Prácticas de Seguridad</h2>
              <p className="text-xl text-gray-400">Cómo mantenemos la seguridad en todo momento</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {securityPractices.map((practice, index) => (
                <motion.div
                  key={practice.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <practice.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{practice.title}</h3>
                  <p className="text-gray-400 mb-6">{practice.description}</p>
                  <ul className="space-y-3">
                    {practice.practices.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Tips */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Consejos de Seguridad</h2>
              <p className="text-xl text-gray-400">Cómo puedes mantener tu cuenta segura</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Para Usuarios</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Habilita la autenticación de dos factores</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Usa contraseñas únicas y seguras</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Revisa regularmente la actividad de tu cuenta</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">No compartas credenciales de acceso</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Para Empresas</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Implementa políticas de contraseñas corporativas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Usa SSO (Single Sign-On) cuando sea posible</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Monitorea el acceso de usuarios regularmente</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Capacita a empleados en seguridad</span>
                  </li>
                </ul>
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
              <h2 className="text-4xl font-bold text-white mb-6">¿Tienes preguntas sobre seguridad?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Nuestro equipo de seguridad está aquí para ayudarte
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Contactar equipo de seguridad
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 
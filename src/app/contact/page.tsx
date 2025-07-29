"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Soporte técnico y consultas generales",
    value: "contact@rubi.ai",
    link: "mailto:contact@rubi.ai",
  },
  {
    icon: Phone,
    title: "Teléfono",
    description: "Soporte telefónico para clientes Pro",
    value: "+34 900 123 456",
    link: "tel:+34900123456",
  },
  {
    icon: MessageSquare,
    title: "Chat en vivo",
    description: "Soporte instantáneo en horario laboral",
    value: "Disponible 24/7",
    link: "#",
  },
  {
    icon: MapPin,
    title: "Oficina",
    description: "Nuestra sede en Madrid",
    value: "Madrid, España",
    link: "#",
  },
];

const faqs = [
  {
    question: "¿Cómo funciona la prueba gratuita?",
    answer:
      "Puedes usar Rubi gratis con 5 chats por día. No necesitas tarjeta de crédito para empezar.",
  },
  {
    question: "¿Qué modelos de IA están disponibles?",
    answer:
      "Ofrecemos acceso a GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo y modelos especializados.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Sí, todos los datos están encriptados y nunca se usan para entrenar modelos externos.",
  },
  {
    question: "¿Puedo cancelar mi suscripción?",
    answer:
      "Sí, puedes cancelar en cualquier momento desde tu panel de control.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
              Contacto
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              ¿Tienes preguntas? Estamos aquí para ayudarte. Nuestro equipo de
              soporte está disponible 24/7.
            </motion.p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
                    <method.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{method.description}</p>
                  <a
                    href={method.link}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {method.value}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  Envíanos un mensaje
                </h2>
                <p className="text-gray-400 mb-8">
                  Completa el formulario y nos pondremos en contacto contigo en
                  menos de 24 horas.
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-effect rounded-2xl p-8 border border-green-600/50 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-gray-400">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Asunto
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600 transition-colors"
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="soporte">Soporte técnico</option>
                        <option value="ventas">Consulta comercial</option>
                        <option value="facturacion">Facturación</option>
                        <option value="general">Consulta general</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors resize-none"
                        placeholder="Cuéntanos cómo podemos ayudarte..."
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-4 rounded-lg font-semibold transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Enviar mensaje</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  Preguntas frecuentes
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-effect rounded-xl p-6 border border-gray-700/50"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-400">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 glass-effect rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center mb-4">
                    <Clock className="w-6 h-6 text-gray-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">
                      Horario de atención
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-2">Soporte técnico: 24/7</p>
                  <p className="text-gray-400 mb-2">
                    Ventas: Lunes a Viernes 9:00 - 18:00 CET
                  </p>
                  <p className="text-gray-400">
                    Tiempo de respuesta: Menos de 24 horas
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

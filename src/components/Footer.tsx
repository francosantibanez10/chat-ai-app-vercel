"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  ArrowUp,
} from "lucide-react";

const footerLinks = {
  producto: [
    { name: "Características", href: "/features" },
    { name: "Precios", href: "/#pricing" },
    { name: "API", href: "/api-docs" },
    { name: "Integraciones", href: "/integrations" },
  ],
  recursos: [
    { name: "Documentación", href: "/api-docs" },
    { name: "Tutoriales", href: "/tutorials" },
    { name: "Blog", href: "/blog" },
    { name: "Casos de uso", href: "/use-cases" },
  ],
  empresa: [
    { name: "Acerca de", href: "/about" },
    { name: "Carreras", href: "/careers" },
    { name: "Contacto", href: "/contact" },
    { name: "Prensa", href: "/press" },
  ],
  legal: [
    { name: "Privacidad", href: "/privacy" },
    { name: "Términos", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "Seguridad", href: "/security" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "Email", icon: Mail, href: "mailto:contact@rubi.ai" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gray-900 border-t border-gray-800">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center mb-6"
            >
              <Crown className="w-8 h-8 text-gray-300 mr-3" />
              <span className="text-2xl font-bold text-white">Rubi</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 mb-6 max-w-md"
            >
              La IA más avanzada para potenciar tu productividad. Análisis
              inteligente de documentos, imágenes y conversaciones.
            </motion.p>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex space-x-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Product links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">Producto</h3>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-3">
              Mantente actualizado
            </h3>
            <p className="text-gray-400 mb-4">
              Recibe las últimas noticias y actualizaciones de Rubi
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 border border-gray-700 hover:border-gray-600"
              >
                Suscribirse
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center text-gray-400 mb-4 md:mb-0">
            <span>© 2025 Rubi. Hecho con</span>
            <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
            <span>en España</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}

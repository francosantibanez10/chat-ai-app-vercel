"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle } from "lucide-react";

const testimonials = [
  {
    name: "Carlos M.",
    plan: "Plus",
    content: "El plan Plus me ha permitido analizar documentos complejos en minutos. La inversión se paga sola.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Ana L.",
    plan: "Pro",
    content: "Como consultora, el plan Pro me da acceso a análisis avanzados que mis clientes valoran mucho.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Miguel R.",
    plan: "Plus",
    content: "La relación calidad-precio es excelente. Nunca había tenido acceso a una IA tan potente.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
];

const guarantees = [
  {
    icon: CheckCircle,
    title: "Garantía de satisfacción",
    description: "14 días de prueba gratuita",
  },
  {
    icon: CheckCircle,
    title: "Cancelación en cualquier momento",
    description: "Sin compromisos a largo plazo",
  },
  {
    icon: CheckCircle,
    title: "Soporte prioritario",
    description: "Respuesta en menos de 24h",
  },
];

export default function PricingTestimonials() {
  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 1,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 30 },
      },
    },
  });

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Testimonios */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Miles de profesionales confían en Rubi para potenciar su productividad
          </p>
        </motion.div>

        <div ref={sliderRef} className="keen-slider mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="keen-slider__slide"
            >
              <div className="glass-effect rounded-2xl p-8 h-full">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-400 text-sm">Plan {testimonial.plan}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-gray-500 mb-4" />
                <p className="text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Garantías */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                <guarantee.icon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{guarantee.title}</h3>
              <p className="text-gray-400">{guarantee.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 
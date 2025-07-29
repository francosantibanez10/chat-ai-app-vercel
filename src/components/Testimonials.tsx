"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    role: "CEO, TechStart",
    content:
      "Rubi revolucionó nuestra productividad. El análisis de documentos es increíblemente preciso y rápido.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    role: "Desarrollador Senior",
    content:
      "La capacidad de generar código y explicar conceptos complejos es simplemente asombrosa. Mi herramienta diaria.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    role: "Consultora de Marketing",
    content:
      "Crear contenido creativo nunca fue tan fácil. Rubi entiende perfectamente mi marca y genera ideas brillantes.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
];

export default function Testimonials() {
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
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Miles de profesionales confían en Rubi para potenciar su
            productividad
          </p>
        </motion.div>

        <div ref={sliderRef} className="keen-slider">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="keen-slider__slide"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-white font-semibold">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
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
      </div>
    </section>
  );
}

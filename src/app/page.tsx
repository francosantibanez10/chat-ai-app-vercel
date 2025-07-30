"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PricingPlans from "@/components/PricingPlans";
import CheckoutModal from "@/components/CheckoutModal";
import { LogOut, User, Crown, X } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ParticlesBackground from "@/components/ParticlesBackground";
import TrustedBy from "@/components/TrustedBy";
import FloatingCTA from "@/components/FloatingCTA";
import TrendingBadge from "@/components/TrendingBadge";
import ChatMockup from "@/components/ChatMockup";
import FeedbackButton from "@/components/FeedbackButton";
import PricingTestimonials from "@/components/PricingTestimonials";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function HomePage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    interval: "month" | "year";
  } | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Manejar scroll a la sección de precios y mostrar modal
  useEffect(() => {
    if (window.location.hash === "#pricing") {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
      // También mostrar el modal de precios
      setShowPricingModal(true);
    }
  }, []);

  const handlePlanSelect = (planId: string) => {
    const plans = {
      free: {
        id: "free",
        name: "Gratis",
        price: 0,
        interval: "month" as const,
      },
      plus: {
        id: "plus",
        name: "Plus",
        price: 20.0, // €20/mes - precio real de Stripe
        interval: "month" as const,
      },
      pro: {
        id: "pro",
        name: "Pro",
        price: 200.0, // €200/mes - precio real de Stripe
        interval: "month" as const,
      },
    };

    const plan = plans[planId as keyof typeof plans];
    if (plan && plan.price > 0) {
      setSelectedPlan(plan);
      setShowCheckout(true);
      toast.success("¡Excelente elección! Redirigiendo al checkout...");
    } else if (planId === "free") {
      if (user) {
        router.push("/chat");
        toast.success("¡Bienvenido de vuelta!");
      } else {
        router.push("/register");
        toast.success("¡Comienza tu viaje con Rubi!");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Fondo de partículas */}
      <ParticlesBackground />

      {/* Header Sticky */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo con animación */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
              </motion.div>
              <span className="text-lg sm:text-xl font-bold text-white">
                Rubi
              </span>
            </motion.div>

            {/* Navigation */}
            <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              {user ? (
                <>
                  <span className="hidden sm:block text-gray-300 text-sm">
                    {user.email}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/chat")}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Chat
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Salir
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/login")}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Ya tengo cuenta</span>
                    <span className="sm:hidden">Entrar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/register")}
                    className="bg-white hover:bg-gray-100 text-gray-900 px-3 sm:px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                  >
                    <span className="hidden lg:inline">
                      Empieza gratis hoy — Sin tarjeta
                    </span>
                    <span className="hidden sm:inline lg:hidden">
                      Empieza gratis
                    </span>
                    <span className="sm:hidden">Gratis</span>
                  </motion.button>
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Prueba social */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-lg text-gray-300 font-medium"
          >
            +10.000 empresas y profesionales ya usan Rubi para mejorar su
            productividad
          </motion.p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-6">
                <TrendingBadge />
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Tu asistente AI disponible 24/7
              </h1>

              <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Multiplica tu productividad: automatiza tareas, analiza
                documentos y crea contenido en un clic
              </p>

              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Ahorra hasta 10 h/semana con respuestas contextuales, análisis
                inmediato de archivos y generación creativa sin límites.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/register")}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-gray-700"
                >
                  Empieza gratis hoy — Sin tarjeta
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/login")}
                  className="text-gray-300 hover:text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors border border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800"
                >
                  Ya tengo cuenta
                </motion.button>
              </div>

              <p className="text-sm text-green-400 mt-4 font-medium">
                ✓ Empieza gratis sin necesidad de tarjeta
              </p>
            </motion.div>

            {/* Mockup del chat */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <ChatMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-32 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingPlans onSelectPlan={handlePlanSelect} showTitle={true} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ahorra horas cada día
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tres funciones poderosas que transforman tu forma de trabajar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Conversa",
                description: "Resuelve dudas y toma decisiones más rápido.",
                examples: "Ej.: Resume tu reunión de equipo al instante.",
                icon: "💬",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Analiza",
                description: "Convierte PDFs y Excel en insights accionables.",
                examples: "Ej.: Detecta cláusulas clave en contratos.",
                icon: "📊",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Crea",
                description: "Genera emails, posts y presentaciones.",
                examples: "Ej.: Escribe tu próximo blog en segundos.",
                icon: "✨",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  {feature.description}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.examples}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Pricing Testimonials */}
      <PricingTestimonials />

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para transformar tu productividad?
            </h2>
            <p className="text-xl text-gray-400 mb-6 max-w-2xl mx-auto">
              Únete a profesionales de empresas, freelancers y equipos que ya
              confían en Rubi
            </p>
            <p className="text-2xl font-bold text-white mb-8">
              Ahorra hasta <span className="text-green-400">10 h/semana</span>{" "}
              con Rubi
            </p>
            <p className="text-sm text-green-400 mb-8 font-medium mx-auto">
              ✓ Empieza gratis sin necesidad de tarjeta
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-12 py-5 rounded-xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-gray-700"
            >
              Empieza gratis hoy — Sin tarjeta
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating CTA for mobile */}
      <FloatingCTA />

      {/* Feedback Button */}
      <FeedbackButton />

      {/* Modal de precios */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Planes de Suscripción
              </h2>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <PricingPlans onSelectPlan={handlePlanSelect} showTitle={false} />
          </div>
        </div>
      )}

      {/* Modal de checkout */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          price={selectedPlan.price}
          interval={selectedPlan.interval}
        />
      )}
    </div>
  );
}

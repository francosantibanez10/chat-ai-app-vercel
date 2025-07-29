"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PricingPlans from "@/components/PricingPlans";
import CheckoutModal from "@/components/CheckoutModal";
import { LogOut, User, Crown } from "lucide-react";
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
  const { user, logout } = useAuth();
  const router = useRouter();

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
          <div className="flex justify-between items-center h-20">
            {/* Logo con animación */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <Crown className="w-8 h-8 text-gray-300" />
              </motion.div>
              <span className="text-xl font-bold text-white">Rubi</span>
            </motion.div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              {user ? (
                <>
                  <span className="text-gray-300 text-sm">{user.email}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/chat")}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Chat
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors"
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
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/register")}
                    className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Registrarse
                  </motion.button>
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-32 px-4 relative">
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

              <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                IA que
                <span className="text-gray-300"> entiende</span>
              </h1>

              <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Conversa, analiza y crea con la inteligencia artificial más
                avanzada del mundo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/register")}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-gray-700"
                >
                  Comenzar gratis
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/login")}
                  className="text-gray-300 hover:text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors border border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800"
                >
                  Iniciar sesión
                </motion.button>
              </div>
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
      <section className="py-32 bg-gray-950">
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
              Todo lo que necesitas en una IA
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Una plataforma completa para todas tus necesidades de inteligencia
              artificial
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Conversa",
                description:
                  "Diálogos naturales con IA que entiende contexto y memoria.",
                icon: "💬",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Analiza",
                description:
                  "Sube archivos y obtén insights inteligentes al instante.",
                icon: "📊",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Crea",
                description:
                  "Genera contenido original con la creatividad de la IA.",
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
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
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
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Únete a miles de profesionales que ya confían en Rubi
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-12 py-5 rounded-xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-gray-700"
            >
              Crear cuenta gratis
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

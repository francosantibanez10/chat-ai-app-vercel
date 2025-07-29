"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Users,
  FileText,
  Bot,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/components/ParticlesBackground";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  badge?: string | null;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    interval: "month",
    features: [
      "5 chats por día",
      "Acceso básico a GPT-3.5",
      "Subida de archivos (hasta 5MB)",
      "Soporte por email",
    ],
    icon: <Star className="w-6 h-6" />,
    color: "text-gray-400",
    badge: null,
  },
  {
    id: "plus",
    name: "Plus",
    price: 14.99,
    interval: "month",
    features: [
      "Chats ilimitados",
      "Acceso a GPT-4o",
      "Subida de archivos (hasta 50MB)",
      "Análisis de imágenes",
      "Soporte prioritario",
      "Sin publicidad",
    ],
    popular: true,
    icon: <Zap className="w-6 h-6" />,
    color: "text-gray-300",
    badge: "Más popular",
  },
  {
    id: "pro",
    name: "Pro",
    price: 159.99,
    interval: "month",
    features: [
      "Todo de Plus",
      "Acceso a modelos avanzados",
      "Subida de archivos (hasta 500MB)",
      "Análisis de documentos complejos",
      "API personalizada",
      "Soporte 24/7",
      "Funciones empresariales",
    ],
    icon: <Crown className="w-6 h-6" />,
    color: "text-gray-300",
    badge: "Best Value",
  },
];

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  showTitle?: boolean;
  compact?: boolean;
}

export default function PricingPlans({
  onSelectPlan,
  showTitle = true,
  compact = false,
}: PricingPlansProps) {
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
    "month"
  );

  const handlePlanSelect = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
      <ParticlesBackground />
      <div className="relative z-10">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Elige tu plan perfecto
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Comienza gratis y mejora cuando lo necesites. Todos los planes
              incluyen acceso completo a la IA más avanzada.
            </p>
          </motion.div>
        )}

        {/* Toggle de intervalo animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <div className="glass-effect rounded-xl p-1 flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedInterval("month")}
              className={`px-8 py-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedInterval === "month"
                  ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mensual
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedInterval("year")}
              className={`px-8 py-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                selectedInterval === "year"
                  ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Anual</span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded-full"
              >
                -33%
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        {/* Planes */}
        <div
          className={`grid gap-4 sm:gap-6 lg:gap-8 ${
            compact
              ? "grid-cols-1 max-w-4xl mx-auto"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan, index) => {
            // Usar los precios reales de Stripe
            const getDisplayPrice = (
              planId: string,
              interval: "month" | "year"
            ) => {
              if (planId === "free") return 0;

              const prices = {
                plus: {
                  month: 14.99,
                  year: 119.99, // Precio real anual de Stripe
                },
                pro: {
                  month: 159.99,
                  year: 999.0, // Precio real anual de Stripe
                },
              };

              return (
                prices[planId as keyof typeof prices]?.[interval] || plan.price
              );
            };

            const displayPrice = getDisplayPrice(plan.id, selectedInterval);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: compact ? 0 : -10 }}
                className={`relative glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10 border transition-all duration-300 hover:shadow-2xl ${
                  compact ? "p-6 sm:p-8 lg:p-10" : "p-4 sm:p-6 lg:p-8 xl:p-10"
                } ${
                  plan.popular
                    ? "border-gray-600 shadow-lg shadow-gray-500/20"
                    : "border-gray-700/50 hover:border-gray-600"
                }`}
              >
                {/* Badge animado */}
                {plan.badge && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <span className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-gray-600 shadow-lg">
                      {plan.badge}
                    </span>
                  </motion.div>
                )}

                <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 mb-4 sm:mb-6 lg:mb-8 border border-gray-600 ${plan.color}`}
                  >
                    {plan.icon}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-4 sm:mb-6 lg:mb-8">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white break-words">
                      {plan.price === 0
                        ? "Gratis"
                        : `$${displayPrice.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-400 ml-1 sm:ml-2 text-base sm:text-lg lg:text-xl">
                        /{selectedInterval === "year" ? "año" : "mes"}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 lg:space-y-5 mb-6 sm:mb-8 lg:mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                      className="flex items-start"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed break-words">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 sm:py-4 lg:py-5 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg lg:text-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl border border-gray-600"
                      : plan.price === 0
                      ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl border border-gray-600"
                      : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl border border-gray-600"
                  }`}
                >
                  <span className="break-words">
                    {plan.price === 0 ? "Comenzar gratis" : "Seleccionar plan"}
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 text-gray-400 text-base"
        >
          <p className="mb-2">
            Puedes cambiar o cancelar tu plan en cualquier momento
          </p>
          <p>Todos los planes incluyen acceso completo a la IA</p>
        </motion.div>
      </div>
    </div>
  );
}

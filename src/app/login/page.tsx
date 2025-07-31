"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import PricingPlans from "@/components/PricingPlans";
import CheckoutModal from "@/components/CheckoutModal";
import ParticlesBackground from "@/components/ParticlesBackground";
import { AuthButtons } from "@/components/ui/AuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    interval: "month" | "year";
  } | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/chat");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      router.push("/chat");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        price: 14.99,
        interval: "month" as const,
      },
      pro: {
        id: "pro",
        name: "Pro",
        price: 159.99,
        interval: "month" as const,
      },
    };

    const plan = plans[planId as keyof typeof plans];
    if (plan && plan.price > 0) {
      setSelectedPlan(plan);
      setShowCheckout(true);
    } else if (planId === "free") {
      // Para el plan gratis, solo redirigir al registro
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      {/* Desktop: Formulario arriba, planes abajo */}
      <div className="hidden lg:block min-h-screen relative z-10">
        {/* Sección de login */}
        <div className="flex items-center justify-center py-16 px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Iniciar sesión
              </h2>
              <p className="text-gray-400">Accede a tu cuenta para continuar</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">
                      O continúa con
                    </span>
                  </div>
                </div>

                <AuthButtons
                  loading={loading}
                  onGoogleClick={handleGoogleSignIn}
                />
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho: Planes */}
        {/* Sección de planes */}
        <div className="bg-gray-950 py-20 px-8">
          <div className="w-full max-w-6xl mx-auto">
            <PricingPlans onSelectPlan={handlePlanSelect} showTitle={true} />
          </div>
        </div>
      </div>

      {/* Mobile: Versión apilada */}
      <div className="lg:hidden relative z-10">
        {/* Sección de login */}
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Iniciar sesión
              </h2>
              <p className="text-gray-400">Accede a tu cuenta para continuar</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">
                      O continúa con
                    </span>
                  </div>
                </div>

                <AuthButtons
                  loading={loading}
                  onGoogleClick={handleGoogleSignIn}
                />
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de planes en móvil */}
        <div className="bg-gray-950 py-20 px-8">
          <PricingPlans onSelectPlan={handlePlanSelect} compact={true} />
        </div>
      </div>

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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (sessionId) {
      // Aquí podrías verificar el estado de la sesión con Stripe
      setSessionData({ sessionId });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-300">
            Tu suscripción ha sido activada correctamente.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Detalles de la transacción
          </h2>
          <p className="text-gray-300 text-sm">
            ID de sesión: {sessionData?.sessionId}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/chat")}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            Ir al chat
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>Recibirás un email de confirmación en breve.</p>
          <p>Si tienes alguna pregunta, contacta con soporte.</p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 
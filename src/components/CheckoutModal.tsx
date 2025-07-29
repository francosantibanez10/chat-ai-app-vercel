"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  price: number;
  interval: 'month' | 'year';
}

export default function CheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  price,
  interval,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Aquí implementarías la llamada a tu API para crear la sesión de Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          interval,
        }),
      });

      const { sessionId } = await response.json();

      // Redirigir a Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) =>
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Error al procesar el pago');
        }
      }
    } catch (err) {
      setError('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Confirmar suscripción</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">{planName}</h3>
            <div className="text-2xl font-bold text-white">
              ${price.toFixed(2)}
              <span className="text-gray-400 text-lg ml-1">
                /{interval === 'year' ? 'año' : 'mes'}
              </span>
            </div>
            {interval === 'year' && (
              <p className="text-green-400 text-sm mt-1">
                ¡Ahorras 20% con el plan anual!
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="text-gray-300 text-sm space-y-2">
            <p>• Acceso inmediato después del pago</p>
            <p>• Cancelación en cualquier momento</p>
            <p>• Facturación automática</p>
            <p>• Soporte prioritario incluido</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Continuar al pago'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
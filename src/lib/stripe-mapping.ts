// Mapeo de planes de la interfaz a los Price IDs reales de Stripe
// Los precios mostrados en la UI son $14.99 y $159.99
// Los precios reales en Stripe son €14.99 y €159.99 (versión 2.0)

export const STRIPE_PRICE_MAPPING = {
  plus: {
    month: "price_1Rnnf9K8PyGecaUxPEAR5fjH", // €14.99/mes
    year: "price_1Rnnf9K8PyGecaUxhfdzUgus", // €119.99/año
  },
  pro: {
    month: "price_1Rnnf9K8PyGecaUxJBH3t5uD", // €159.99/mes
    year: "price_1Rnnf9K8PyGecaUxWgNk9rsq", // €999.00/año
  },
};

// Función para obtener el Price ID real de Stripe
export function getStripePriceId(
  planId: string,
  interval: "month" | "year"
): string | null {
  const plan =
    STRIPE_PRICE_MAPPING[planId as keyof typeof STRIPE_PRICE_MAPPING];
  if (!plan) return null;

  return plan[interval];
}

// Función para obtener el precio real de Stripe (en centavos)
export function getStripePriceAmount(planId: string): number {
  const prices = {
    plus: 1499, // €14.99 en centavos
    pro: 15999, // €159.99 en centavos
  };

  return prices[planId as keyof typeof prices] || 0;
}

// Función para obtener la moneda de Stripe
export function getStripeCurrency(): string {
  return "eur"; // Euros, según tu configuración de Stripe
}

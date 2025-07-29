import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Configuración para Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { planId, interval } = await request.json();

    // Obtener el Price ID real de Stripe usando el mapeo
    const priceId = getStripePriceId(planId, interval);

    if (!priceId) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    // Usar Firebase Functions para crear la sesión de checkout
    const functionsUrl =
      process.env.FIREBASE_FUNCTIONS_URL ||
      "https://us-central1-mineral-nebula-459522-a9.cloudfunctions.net";

    const response = await fetch(`${functionsUrl}/createCheckoutSession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        userId: "user_id", // Esto se puede obtener del contexto de autenticación
        successUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/login`,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al crear sesión de checkout en el servidor");
    }

    const { sessionId } = await response.json();
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

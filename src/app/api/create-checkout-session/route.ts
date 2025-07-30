import { NextRequest, NextResponse } from "next/server";

// Configuración para Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { planId, planName, price, interval } = await request.json();

    if (!planId || !planName || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Simular creación de sesión de checkout
    return NextResponse.json({
      sessionId: "cs_test_" + Math.random().toString(36).substr(2, 9),
      url: "https://checkout.stripe.com/pay/cs_test_...",
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

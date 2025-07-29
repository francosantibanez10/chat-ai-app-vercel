import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidar cada hora

export async function GET() {
  try {
    // Usar Firebase Functions para obtener productos
    const functionsUrl =
      process.env.FIREBASE_FUNCTIONS_URL ||
      "https://us-central1-mineral-nebula-459522-a9.cloudfunctions.net";

    const response = await fetch(`${functionsUrl}/getStripeProducts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al consultar Firebase Functions");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    return NextResponse.json(
      { error: "Error al obtener productos de Stripe" },
      { status: 500 }
    );
  }
}

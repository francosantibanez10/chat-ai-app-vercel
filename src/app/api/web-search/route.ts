import { NextRequest, NextResponse } from "next/server";

// Configuración para Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Simular respuesta de búsqueda web
    return NextResponse.json({
      results: [
        {
          title: "Resultado de búsqueda",
          snippet: "Este es un resultado de búsqueda simulado",
          url: "https://example.com"
        }
      ]
    });
  } catch (error) {
    console.error("Error in web search:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}

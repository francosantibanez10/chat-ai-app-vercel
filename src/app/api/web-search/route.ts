import { NextRequest, NextResponse } from "next/server";

// Configuración para Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Usar SerpAPI para búsqueda web (necesitas una API key)
    const serpApiKey = process.env.SERP_API_KEY;

    if (!serpApiKey) {
      // Fallback: devolver información simulada
      return NextResponse.json({
        results: [
          {
            title: "Búsqueda web simulada",
            snippet: `Resultados de búsqueda para: "${query}". Esta es una simulación de búsqueda web. Para funcionalidad completa, configura SERP_API_KEY en tus variables de entorno.`,
            link: "#",
          },
        ],
        searchQuery: query,
      });
    }

    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
        query
      )}&api_key=${serpApiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.organic_results?.slice(0, 5) || [],
      searchQuery: query,
    });
  } catch (error) {
    console.error("Error in web search:", error);
    return NextResponse.json(
      { error: "Failed to perform web search" },
      { status: 500 }
    );
  }
}

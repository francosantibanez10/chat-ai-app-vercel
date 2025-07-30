export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  publishedDate?: string;
}

export interface WebSearchResponse {
  results: SearchResult[];
  totalResults?: number;
  searchTime?: number;
  error?: string;
}

// Función para buscar en la web usando DuckDuckGo Instant Answer API
export const searchWeb = async (query: string): Promise<WebSearchResponse> => {
  try {
    // Usar DuckDuckGo Instant Answer API (gratuita y sin API key)
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Procesar resultados de DuckDuckGo
    const results: SearchResult[] = [];
    
    // Agregar respuesta instantánea si existe
    if (data.Abstract) {
      results.push({
        title: data.Heading || "Respuesta instantánea",
        url: data.AbstractURL || "",
        snippet: data.Abstract,
        source: data.AbstractSource,
      });
    }

    // Agregar temas relacionados
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text,
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      });
    }

    // Si no hay resultados de DuckDuckGo, usar un fallback
    if (results.length === 0) {
      return {
        results: [{
          title: "No se encontraron resultados",
          url: "",
          snippet: `No se encontraron resultados para "${query}". Intenta con términos diferentes o verifica la ortografía.`,
        }],
        totalResults: 0,
      };
    }

    return {
      results,
      totalResults: results.length,
      searchTime: Date.now(),
    };

  } catch (error) {
    console.error('Error searching web:', error);
    return {
      results: [{
        title: "Error en la búsqueda",
        url: "",
        snippet: "No se pudo realizar la búsqueda en este momento. Verifica tu conexión a internet e intenta de nuevo.",
      }],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para buscar noticias
export const searchNews = async (query: string): Promise<WebSearchResponse> => {
  try {
    // Usar DuckDuckGo con parámetros de noticias
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + " news")}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    // Procesar resultados de noticias
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 10).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text,
            url: topic.FirstURL,
            snippet: topic.Text,
            source: "DuckDuckGo",
          });
        }
      });
    }

    return {
      results,
      totalResults: results.length,
      searchTime: Date.now(),
    };

  } catch (error) {
    console.error('Error searching news:', error);
    return {
      results: [{
        title: "Error en la búsqueda de noticias",
        url: "",
        snippet: "No se pudieron obtener noticias en este momento.",
      }],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para obtener información del clima
export const getWeather = async (location: string): Promise<WebSearchResponse> => {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(location + " weather")}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.Abstract) {
      results.push({
        title: `Clima en ${location}`,
        url: data.AbstractURL || "",
        snippet: data.Abstract,
        source: data.AbstractSource || "DuckDuckGo",
      });
    }

    return {
      results,
      totalResults: results.length,
      searchTime: Date.now(),
    };

  } catch (error) {
    console.error('Error getting weather:', error);
    return {
      results: [{
        title: "Error al obtener el clima",
        url: "",
        snippet: "No se pudo obtener información del clima en este momento.",
      }],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para obtener definiciones
export const getDefinition = async (word: string): Promise<WebSearchResponse> => {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent("define " + word)}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.Abstract) {
      results.push({
        title: `Definición de "${word}"`,
        url: data.AbstractURL || "",
        snippet: data.Abstract,
        source: data.AbstractSource || "DuckDuckGo",
      });
    }

    return {
      results,
      totalResults: results.length,
      searchTime: Date.now(),
    };

  } catch (error) {
    console.error('Error getting definition:', error);
    return {
      results: [{
        title: "Error al obtener la definición",
        url: "",
        snippet: "No se pudo obtener la definición en este momento.",
      }],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para detectar el tipo de búsqueda
export const detectSearchType = (query: string): 'general' | 'news' | 'weather' | 'definition' => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('noticias') || lowerQuery.includes('news') || lowerQuery.includes('últimas')) {
    return 'news';
  }
  
  if (lowerQuery.includes('clima') || lowerQuery.includes('weather') || lowerQuery.includes('temperatura')) {
    return 'weather';
  }
  
  if (lowerQuery.startsWith('define ') || lowerQuery.startsWith('qué es ') || lowerQuery.startsWith('significado de ')) {
    return 'definition';
  }
  
  return 'general';
};

// Función principal de búsqueda inteligente
export const intelligentSearch = async (query: string): Promise<WebSearchResponse> => {
  const searchType = detectSearchType(query);
  
  switch (searchType) {
    case 'news':
      return await searchNews(query);
    case 'weather':
      return await getWeather(query);
    case 'definition':
      const word = query.replace(/^(define|qué es|significado de)\s+/i, '');
      return await getDefinition(word);
    default:
      return await searchWeb(query);
  }
}; 
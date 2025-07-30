export interface ImageGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  model?: 'dall-e-2' | 'dall-e-3';
}

export interface ImageGenerationResponse {
  url: string;
  revisedPrompt?: string;
  error?: string;
}

export const generateImage = async (
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        style: request.style || 'vivid',
        model: request.model || 'dall-e-3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      url: data.url,
      revisedPrompt: data.revisedPrompt,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Error desconocido al generar imagen',
    };
  }
};

export const validateImagePrompt = (prompt: string): { isValid: boolean; error?: string } => {
  if (!prompt.trim()) {
    return { isValid: false, error: 'El prompt no puede estar vacío' };
  }

  if (prompt.length < 3) {
    return { isValid: false, error: 'El prompt debe tener al menos 3 caracteres' };
  }

  if (prompt.length > 1000) {
    return { isValid: false, error: 'El prompt no puede exceder 1000 caracteres' };
  }

  // Verificar contenido inapropiado (lista básica)
  const inappropriateWords = [
    'violencia', 'sangre', 'muerte', 'drogas', 'alcohol', 'tabaco',
    'violence', 'blood', 'death', 'drugs', 'alcohol', 'tobacco'
  ];

  const lowerPrompt = prompt.toLowerCase();
  for (const word of inappropriateWords) {
    if (lowerPrompt.includes(word)) {
      return { isValid: false, error: 'El prompt contiene contenido inapropiado' };
    }
  }

  return { isValid: true };
};

export const getImageGenerationSuggestions = (): string[] => [
  'Un gato espacial explorando una galaxia colorida',
  'Una casa de árbol futurista en un bosque mágico',
  'Un robot chef preparando comida en una cocina moderna',
  'Un paisaje de montañas con auroras boreales',
  'Una ciudad flotante en las nubes al atardecer',
  'Un dragón amigable leyendo un libro en una biblioteca',
  'Un jardín zen con flores que brillan en la oscuridad',
  'Una nave espacial vintage volando sobre un planeta alienígena',
  'Un castillo de cristal en una isla tropical',
  'Un científico loco en su laboratorio lleno de inventos',
]; 
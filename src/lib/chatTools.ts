// Configuración para las herramientas del chat
export interface ChatToolsConfig {
  enableEditing: boolean;
  enableDeletion: boolean;
  enableRegeneration: boolean;
  enableFeedback: boolean;
  enableTTS: boolean;
  enableImageSaving: boolean;
  enableSharing: boolean;
  maxMessageLength: number;
  allowMessageHistory: boolean;
}

export const defaultChatToolsConfig: ChatToolsConfig = {
  enableEditing: true,
  enableDeletion: true,
  enableRegeneration: true,
  enableFeedback: true,
  enableTTS: true,
  enableImageSaving: true,
  enableSharing: true,
  maxMessageLength: 4000,
  allowMessageHistory: true,
};

// Funciones de utilidad para las herramientas
export const validateMessageContent = (content: string, maxLength: number = 4000): boolean => {
  return content.trim().length > 0 && content.length <= maxLength;
};

export const sanitizeMessageContent = (content: string): string => {
  // Eliminar caracteres peligrosos y normalizar
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const formatMessageForSharing = (content: string, metadata?: any): string => {
  let formattedContent = content;
  
  if (metadata?.model) {
    formattedContent += `\n\n---\nModelo: ${metadata.model}`;
  }
  
  if (metadata?.timestamp) {
    formattedContent += `\nFecha: ${new Date(metadata.timestamp).toLocaleString()}`;
  }
  
  return formattedContent;
};

// Configuración de TTS
export interface TTSConfig {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  voice?: string;
}

export const defaultTTSConfig: TTSConfig = {
  language: 'es-ES',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// Configuración de feedback
export interface FeedbackConfig {
  enableAnonymous: boolean;
  requireReason: boolean;
  categories: string[];
  maxLength: number;
}

export const defaultFeedbackConfig: FeedbackConfig = {
  enableAnonymous: false,
  requireReason: false,
  categories: ['Calidad', 'Relevancia', 'Claridad', 'Otro'],
  maxLength: 500,
}; 
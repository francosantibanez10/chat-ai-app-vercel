import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface LanguageDetection {
  language: string;
  confidence: number;
  detectedLanguages: Array<{ language: string; confidence: number }>;
  isMixed: boolean;
}

export interface ToneAnalysis {
  formality: "formal" | "casual" | "neutral";
  emotion: "happy" | "sad" | "angry" | "neutral" | "excited" | "concerned";
  politeness: "polite" | "direct" | "rude";
  urgency: "low" | "medium" | "high";
  confidence: number;
}

export interface UserLanguagePreferences {
  userId: string;
  primaryLanguage: string;
  secondaryLanguages: string[];
  preferredResponseLanguage: string;
  formalityPreference: "formal" | "casual" | "adaptive";
  tonePreferences: {
    professional: boolean;
    friendly: boolean;
    concise: boolean;
    detailed: boolean;
  };
  autoTranslate: boolean;
  lastUpdated: Date;
}

export interface TranslationRequest {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  preserveTone: boolean;
  context?: string;
}

export interface MultilingualResponse {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  targetLanguage: string;
  confidence: number;
  tonePreserved: boolean;
}

export class MultilingualSystem {
  private static instance: MultilingualSystem;
  private userPreferences: Map<string, UserLanguagePreferences> = new Map();
  private languageStats: Map<string, { count: number; lastUsed: Date }> =
    new Map();

  private constructor() {}

  static getInstance(): MultilingualSystem {
    if (!MultilingualSystem.instance) {
      MultilingualSystem.instance = new MultilingualSystem();
    }
    return MultilingualSystem.instance;
  }

  /**
   * Detectar idioma del texto
   */
  async detectLanguage(text: string): Promise<LanguageDetection> {
    const detectionPrompt = `
Detecta el idioma del siguiente texto:

Texto: "${text}"

Proporciona:
1. Idioma principal detectado
2. Nivel de confianza (0-1)
3. Lista de idiomas detectados con confianza
4. Si es texto mixto (múltiples idiomas)

Responde con JSON:
{
  "language": "es",
  "confidence": 0.95,
  "detectedLanguages": [
    {"language": "es", "confidence": 0.95},
    {"language": "en", "confidence": 0.05}
  ],
  "isMixed": false
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: detectionPrompt }],
        temperature: 0.1,
        maxTokens: 300,
      });

      const textResult = await this.getTextSafely(result);

      // Verificar si el resultado es un error
      if (textResult.startsWith("Error:")) {
        return {
          language: "en",
          confidence: 0.5,
          detectedLanguages: [{ language: "en", confidence: 0.5 }],
          isMixed: false,
        };
      }

      const detection = JSON.parse(textResult);

      // Actualizar estadísticas
      this.updateLanguageStats(detection.language);

      return {
        language: detection.language || "en",
        confidence: detection.confidence || 0.5,
        detectedLanguages: detection.detectedLanguages || [
          {
            language: detection.language || "en",
            confidence: detection.confidence || 0.5,
          },
        ],
        isMixed: detection.isMixed || false,
      };
    } catch (error) {
      console.error("Error detecting language:", error);
      return {
        language: "en",
        confidence: 0.5,
        detectedLanguages: [{ language: "en", confidence: 0.5 }],
        isMixed: false,
      };
    }
  }

  /**
   * Analizar tono del texto
   */
  async analyzeTone(
    text: string,
    language: string = "en"
  ): Promise<ToneAnalysis> {
    const tonePrompt = `
Analiza el tono del siguiente texto:

Idioma: ${language}
Texto: "${text}"

Analiza:
1. Formalidad (formal/casual/neutral)
2. Emoción (happy/sad/angry/neutral/excited/concerned)
3. Cortesía (polite/direct/rude)
4. Urgencia (low/medium/high)
5. Confianza en el análisis (0-1)

Responde con JSON:
{
  "formality": "casual",
  "emotion": "happy",
  "politeness": "polite",
  "urgency": "low",
  "confidence": 0.8
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: tonePrompt }],
        temperature: 0.1,
        maxTokens: 300,
      });

      const textResult = await this.getTextSafely(result);

      // Verificar si el resultado es un error
      if (textResult.startsWith("Error:")) {
        return {
          formality: "neutral" as const,
          emotion: "neutral" as const,
          politeness: "polite" as const,
          urgency: "low" as const,
          confidence: 0.5,
        };
      }

      return JSON.parse(textResult);
    } catch (error) {
      console.error("Error analyzing tone:", error);
      return {
        formality: "neutral" as const,
        emotion: "neutral" as const,
        politeness: "polite" as const,
        urgency: "low" as const,
        confidence: 0.5,
      };
    }
  }

  /**
   * Traducir texto preservando el tono
   */
  async translateText(
    request: TranslationRequest
  ): Promise<MultilingualResponse> {
    const translationPrompt = `
Traduce el siguiente texto preservando el tono y estilo:

Texto original: "${request.sourceText}"
Idioma origen: ${request.sourceLanguage}
Idioma destino: ${request.targetLanguage}
Preservar tono: ${request.preserveTone}
Contexto: ${request.context || "N/A"}

Instrucciones:
- Mantén el mismo nivel de formalidad
- Preserva la emoción y tono del texto original
- Adapta expresiones idiomáticas apropiadamente
- Mantén la estructura y flujo natural

Responde con JSON:
{
  "translatedText": "texto traducido",
  "confidence": 0.9,
  "tonePreserved": true
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: translationPrompt }],
        temperature: 0.3,
        maxTokens: 500,
      });

      const translation = JSON.parse(await this.getTextSafely(result));

      return {
        originalText: request.sourceText,
        translatedText: translation.translatedText,
        detectedLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: translation.confidence || 0.8,
        tonePreserved: translation.tonePreserved || false,
      };
    } catch (error) {
      console.error("Error translating text:", error);
      return {
        originalText: request.sourceText,
        translatedText: request.sourceText, // Fallback
        detectedLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: 0.5,
        tonePreserved: false,
      };
    }
  }

  /**
   * Adaptar respuesta al idioma y tono del usuario
   */
  async adaptResponse(
    response: string,
    userLanguage: string,
    userTone: ToneAnalysis,
    targetLanguage?: string
  ): Promise<string> {
    if (targetLanguage && targetLanguage !== userLanguage) {
      const translation = await this.translateText({
        sourceText: response,
        sourceLanguage: userLanguage,
        targetLanguage,
        preserveTone: true,
        context: "Respuesta de IA",
      });
      return translation.translatedText;
    }

    // Adaptar tono si es necesario
    const responseTone = await this.analyzeTone(response, userLanguage);

    if (this.shouldAdaptTone(userTone, responseTone)) {
      return await this.adaptTone(response, userTone, userLanguage);
    }

    return response;
  }

  /**
   * Adaptar tono de la respuesta
   */
  private async adaptTone(
    text: string,
    targetTone: ToneAnalysis,
    language: string
  ): Promise<string> {
    const adaptationPrompt = `
Adapta el tono del siguiente texto:

Texto: "${text}"
Idioma: ${language}

Tono objetivo:
- Formalidad: ${targetTone.formality}
- Emoción: ${targetTone.emotion}
- Cortesía: ${targetTone.politeness}
- Urgencia: ${targetTone.urgency}

Adapta el texto manteniendo el mismo significado pero con el tono especificado.`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: adaptationPrompt }],
        temperature: 0.7,
        maxTokens: 1000,
      });

      return await this.getTextSafely(result);
    } catch (error) {
      console.error("Error adapting tone:", error);
      return text;
    }
  }

  /**
   * Determinar si se debe adaptar el tono
   */
  private shouldAdaptTone(
    userTone: ToneAnalysis,
    responseTone: ToneAnalysis
  ): boolean {
    // Adaptar si hay diferencias significativas
    return (
      userTone.formality !== responseTone.formality ||
      userTone.politeness !== responseTone.politeness ||
      Math.abs(userTone.confidence - responseTone.confidence) > 0.3
    );
  }

  /**
   * Helper function para obtener texto de manera segura
   */
  private async getTextSafely(result: any): Promise<string> {
    try {
      if (typeof result === "string") {
        return result;
      }
      if (result && typeof result.text === "function") {
        return await result.text();
      }
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      console.error("Error getting text safely:", error);
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Obtener o crear preferencias de idioma del usuario
   */
  getUserLanguagePreferences(userId: string): UserLanguagePreferences {
    if (!this.userPreferences.has(userId)) {
      const defaultPreferences: UserLanguagePreferences = {
        userId,
        primaryLanguage: "es",
        secondaryLanguages: ["en"],
        preferredResponseLanguage: "es",
        formalityPreference: "adaptive",
        tonePreferences: {
          professional: true,
          friendly: true,
          concise: false,
          detailed: true,
        },
        autoTranslate: false,
        lastUpdated: new Date(),
      };
      this.userPreferences.set(userId, defaultPreferences);
    }
    return this.userPreferences.get(userId)!;
  }

  /**
   * Actualizar preferencias de idioma del usuario
   */
  updateUserLanguagePreferences(
    userId: string,
    preferences: Partial<UserLanguagePreferences>
  ): void {
    const currentPreferences = this.getUserLanguagePreferences(userId);
    const updatedPreferences: UserLanguagePreferences = {
      ...currentPreferences,
      ...preferences,
      lastUpdated: new Date(),
    };
    this.userPreferences.set(userId, updatedPreferences);
  }

  /**
   * Aprender preferencias de idioma del usuario
   */
  async learnUserLanguagePreferences(
    userId: string,
    userMessage: string,
    userResponse: string
  ): Promise<void> {
    const languageDetection = await this.detectLanguage(userMessage);
    const toneAnalysis = await this.analyzeTone(
      userMessage,
      languageDetection.language
    );

    const preferences = this.getUserLanguagePreferences(userId);

    // Actualizar idioma principal si es más confiable
    if (languageDetection.confidence > 0.8) {
      preferences.primaryLanguage = languageDetection.language;
    }

    // Aprender preferencias de tono
    if (toneAnalysis.confidence > 0.7) {
      preferences.formalityPreference =
        toneAnalysis.formality === "neutral"
          ? "adaptive"
          : toneAnalysis.formality;
      preferences.tonePreferences.professional =
        toneAnalysis.formality === "formal";
      preferences.tonePreferences.friendly =
        toneAnalysis.politeness === "polite";
    }

    this.userPreferences.set(userId, preferences);
  }

  /**
   * Generar prompt multilingüe
   */
  generateMultilingualPrompt(
    basePrompt: string,
    userPreferences: UserLanguagePreferences,
    detectedLanguage: string
  ): string {
    const languageInstructions = `
INSTRUCCIONES MULTILINGÜES:
- Idioma del usuario: ${detectedLanguage}
- Idioma preferido para respuestas: ${userPreferences.preferredResponseLanguage}
- Nivel de formalidad preferido: ${userPreferences.formalityPreference}
- Traducción automática: ${
      userPreferences.autoTranslate ? "Activada" : "Desactivada"
    }

${
  userPreferences.preferredResponseLanguage !== detectedLanguage
    ? `IMPORTANTE: Responde en ${userPreferences.preferredResponseLanguage} a menos que el usuario especifique lo contrario.`
    : "Responde en el mismo idioma que el usuario."
}

${
  userPreferences.formalityPreference === "formal"
    ? "Usa un tono formal y profesional."
    : userPreferences.formalityPreference === "casual"
    ? "Usa un tono casual y amigable."
    : "Adapta el tono según el contexto de la conversación."
}

${
  userPreferences.tonePreferences.concise ? "Sé conciso en tus respuestas." : ""
}
${
  userPreferences.tonePreferences.detailed
    ? "Proporciona detalles cuando sea útil."
    : ""
}
`;

    return `${basePrompt}\n\n${languageInstructions}`;
  }

  /**
   * Actualizar estadísticas de idioma
   */
  private updateLanguageStats(language: string): void {
    const stats = this.languageStats.get(language) || {
      count: 0,
      lastUsed: new Date(),
    };
    stats.count++;
    stats.lastUsed = new Date();
    this.languageStats.set(language, stats);
  }

  /**
   * Obtener estadísticas de idiomas
   */
  getLanguageStats(): {
    totalDetections: number;
    mostUsedLanguage: string;
    languageBreakdown: Record<string, number>;
    recentLanguages: string[];
  } {
    const totalDetections = Array.from(this.languageStats.values()).reduce(
      (sum, stats) => sum + stats.count,
      0
    );

    const mostUsedLanguage =
      Array.from(this.languageStats.entries()).sort(
        ([, a], [, b]) => b.count - a.count
      )[0]?.[0] || "N/A";

    const languageBreakdown: Record<string, number> = {};
    this.languageStats.forEach((stats, language) => {
      languageBreakdown[language] = stats.count;
    });

    const recentLanguages = Array.from(this.languageStats.entries())
      .sort(([, a], [, b]) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 5)
      .map(([language]) => language);

    return {
      totalDetections,
      mostUsedLanguage,
      languageBreakdown,
      recentLanguages,
    };
  }

  /**
   * Obtener usuarios por idioma
   */
  getUsersByLanguage(language: string): string[] {
    const users: string[] = [];
    this.userPreferences.forEach((preferences, userId) => {
      if (preferences.primaryLanguage === language) {
        users.push(userId);
      }
    });
    return users;
  }

  /**
   * Limpiar datos antiguos
   */
  cleanupOldData(maxAgeDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    // Limpiar estadísticas de idioma antiguas
    for (const [language, stats] of Array.from(this.languageStats.entries())) {
      if (stats.lastUsed < cutoffDate && stats.count < 10) {
        this.languageStats.delete(language);
      }
    }

    // Limpiar preferencias de usuario antiguas
    for (const [userId, preferences] of Array.from(
      this.userPreferences.entries()
    )) {
      if (preferences.lastUpdated < cutoffDate) {
        this.userPreferences.delete(userId);
      }
    }
  }
}

export const multilingualSystem = MultilingualSystem.getInstance();

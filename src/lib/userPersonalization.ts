import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface ContextAnalysis {
  hasCompleteInfo: boolean;
  missingInfo: string[];
  suggestedQuestions: string[];
  contextType:
    | "programming"
    | "fitness"
    | "diet"
    | "business"
    | "writing"
    | "general";
  confidence: number;
  shouldAskQuestions: boolean;
}

export interface UserProfile {
  userId: string;
  preferences: {
    communicationStyle:
      | "formal"
      | "casual"
      | "technical"
      | "friendly"
      | "concise";
    detailLevel: "minimal" | "moderate" | "detailed" | "comprehensive";
    language: "es" | "en";
    topics: string[];
    expertise: {
      level: "beginner" | "intermediate" | "advanced" | "expert";
      domains: string[];
    };
    responseFormat: "text" | "structured" | "visual" | "mixed";
    examples: boolean;
    humor: boolean;
    citations: boolean;
  };
  behavior: {
    averageMessageLength: number;
    commonTopics: string[];
    preferredResponseTime: "fast" | "normal" | "thorough";
    feedbackHistory: Array<{
      type: "positive" | "negative" | "neutral";
      reason: string;
      timestamp: Date;
    }>;
  };
  context: {
    timezone: string;
    location: string;
    profession: string;
    interests: string[];
    goals: string[];
  };
  learning: {
    knowledgeGaps: string[];
    learningGoals: string[];
    preferredLearningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  };
}

export interface PersonalizedPrompt {
  systemPrompt: string;
  userContext: string;
  styleInstructions: string;
  expertiseLevel: string;
}

export class UserPersonalization {
  private static instance: UserPersonalization;
  private profiles: Map<string, UserProfile> = new Map();

  private constructor() {}

  static getInstance(): UserPersonalization {
    if (!UserPersonalization.instance) {
      UserPersonalization.instance = new UserPersonalization();
    }
    return UserPersonalization.instance;
  }

  /**
   * Obtiene o crea el perfil de un usuario
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.profiles.has(userId)) {
      return this.profiles.get(userId)!;
    }

    // Crear perfil por defecto
    const defaultProfile: UserProfile = {
      userId,
      preferences: {
        communicationStyle: "friendly",
        detailLevel: "moderate",
        language: "es",
        topics: [],
        expertise: {
          level: "intermediate",
          domains: [],
        },
        responseFormat: "text",
        examples: true,
        humor: false,
        citations: false,
      },
      behavior: {
        averageMessageLength: 50,
        commonTopics: [],
        preferredResponseTime: "normal",
        feedbackHistory: [],
      },
      context: {
        timezone: "UTC",
        location: "",
        profession: "",
        interests: [],
        goals: [],
      },
      learning: {
        knowledgeGaps: [],
        learningGoals: [],
        preferredLearningStyle: "reading",
      },
    };

    this.profiles.set(userId, defaultProfile);
    return defaultProfile;
  }

  /**
   * Actualiza el perfil del usuario basado en la interacción
   */
  async updateProfileFromInteraction(
    userId: string,
    userMessage: string,
    aiResponse: string,
    feedback?: "positive" | "negative" | "neutral"
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);

    // Analizar el mensaje del usuario para actualizar preferencias
    await this.analyzeUserMessage(userMessage, profile);

    // Analizar la respuesta de la IA para ajustar el estilo
    await this.analyzeAIResponse(aiResponse, profile);

    // Actualizar historial de feedback
    if (feedback) {
      profile.behavior.feedbackHistory.push({
        type: feedback,
        reason: "User feedback",
        timestamp: new Date(),
      });
    }

    // Limpiar historial antiguo
    this.cleanupFeedbackHistory(profile);

    this.profiles.set(userId, profile);
  }

  /**
   * Genera un prompt personalizado para el usuario
   */
  async generatePersonalizedPrompt(
    userId: string,
    basePrompt: string,
    currentQuery: string
  ): Promise<PersonalizedPrompt> {
    const profile = await this.getUserProfile(userId);

    const styleInstructions = this.generateStyleInstructions(profile);
    const expertiseLevel = this.generateExpertiseLevel(profile);
    const userContext = this.generateUserContext(profile);

    const personalizedSystemPrompt = `
${basePrompt}

CONTEXTO PERSONALIZADO DEL USUARIO:
${userContext}

INSTRUCCIONES DE ESTILO:
${styleInstructions}

NIVEL DE EXPERTISE:
${expertiseLevel}

ADAPTACIÓN ESPECÍFICA:
- Estilo de comunicación: ${profile.preferences.communicationStyle}
- Nivel de detalle: ${profile.preferences.detailLevel}
- Incluir ejemplos: ${profile.preferences.examples ? "Sí" : "No"}
- Usar humor: ${profile.preferences.humor ? "Sí" : "No"}
- Incluir citaciones: ${profile.preferences.citations ? "Sí" : "No"}

Recuerda: Adapta tu respuesta específicamente para este usuario basándote en su perfil y preferencias.
`;

    return {
      systemPrompt: personalizedSystemPrompt,
      userContext,
      styleInstructions,
      expertiseLevel,
    };
  }

  /**
   * Analiza el mensaje del usuario para actualizar preferencias
   */
  private async analyzeUserMessage(
    message: string,
    profile: UserProfile
  ): Promise<void> {
    try {
      const analysisPrompt = `
Analiza el siguiente mensaje del usuario y extrae información sobre sus preferencias de comunicación.
Responde SOLO en formato JSON válido con las siguientes claves:
{
  "communicationStyle": "formal|casual|technical|friendly|concise",
  "detailLevel": "minimal|moderate|detailed|comprehensive", 
  "topics": ["tema1", "tema2"],
  "expertiseLevel": "beginner|intermediate|advanced|expert",
  "goals": ["objetivo1", "objetivo2"]
}

Mensaje: "${message}"

JSON:`;

      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content:
              "Eres un analizador experto de preferencias de comunicación. Responde SOLO en formato JSON válido.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        maxTokens: 300,
        temperature: 0.1,
      });

      const textResult = await this.getTextSafely(result);

      // Validar que el texto sea JSON válido antes de parsear
      if (
        !textResult ||
        textResult.trim() === "" ||
        textResult.startsWith("Error:")
      ) {
        console.warn("Empty or error result from AI analysis:", textResult);
        return;
      }

      // Intentar limpiar el JSON si tiene caracteres extra
      let cleanJson = textResult.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/```\n?/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/```\n?/, "");
      }

      try {
        const analysis = JSON.parse(cleanJson);

        // Actualizar preferencias
        if (analysis.communicationStyle) {
          profile.preferences.communicationStyle = analysis.communicationStyle;
        }
        if (analysis.detailLevel) {
          profile.preferences.detailLevel = analysis.detailLevel;
        }
        if (analysis.topics && Array.isArray(analysis.topics)) {
          profile.context.interests = [
            ...new Set([...profile.context.interests, ...analysis.topics]),
          ];
        }
        if (analysis.expertiseLevel) {
          profile.preferences.expertise.level = analysis.expertiseLevel;
        }
        if (analysis.goals && Array.isArray(analysis.goals)) {
          profile.context.goals = [
            ...new Set([...profile.context.goals, ...analysis.goals]),
          ];
        }
      } catch (parseError) {
        console.error("Error parsing JSON from AI analysis:", parseError);
        console.error("Raw text received:", textResult);
        console.error("Cleaned JSON:", cleanJson);
      }
    } catch (error) {
      console.error("Error analyzing user message:", error);
    }
  }

  /**
   * Analiza la respuesta de la IA para ajustar el estilo
   */
  private async analyzeAIResponse(
    response: string,
    profile: UserProfile
  ): Promise<void> {
    // Actualizar longitud promedio de mensajes
    profile.behavior.averageMessageLength =
      (profile.behavior.averageMessageLength + response.length) / 2;
  }

  /**
   * Genera instrucciones de estilo personalizadas
   */
  private generateStyleInstructions(profile: UserProfile): string {
    const styleMap = {
      formal:
        "Usa un tono profesional y formal. Evita jerga casual y mantén un lenguaje preciso.",
      casual:
        "Usa un tono relajado y amigable. Puedes usar expresiones informales y ser más conversacional.",
      technical:
        "Usa terminología técnica precisa. Incluye detalles técnicos y especificaciones cuando sea relevante.",
      friendly:
        "Mantén un tono cálido y acogedor. Sé empático y muestra interés genuino en ayudar.",
      concise:
        "Sé directo y conciso. Ve al grano y evita explicaciones innecesarias.",
    };

    const detailMap = {
      minimal:
        "Proporciona respuestas breves y directas. Incluye solo la información esencial.",
      moderate:
        "Equilibra detalle y concisión. Proporciona contexto suficiente sin ser excesivo.",
      detailed:
        "Proporciona explicaciones completas con ejemplos y contexto adicional.",
      comprehensive:
        "Ofrece análisis exhaustivos con múltiples perspectivas y consideraciones.",
    };

    return `
${styleMap[profile.preferences.communicationStyle] || styleMap.friendly}
${detailMap[profile.preferences.detailLevel] || detailMap.moderate}
${
  profile.preferences.examples
    ? "Incluye ejemplos prácticos cuando sea útil."
    : ""
}
${
  profile.preferences.humor
    ? "Puedes usar un toque de humor apropiado cuando sea oportuno."
    : ""
}
${
  profile.preferences.citations
    ? "Cita fuentes cuando proporciones información específica."
    : ""
}
`;
  }

  /**
   * Genera nivel de expertise personalizado
   */
  private generateExpertiseLevel(profile: UserProfile): string {
    const expertiseMap = {
      beginner:
        "Explica conceptos básicos y proporciona contexto. Evita jerga técnica compleja.",
      intermediate:
        "Usa terminología técnica moderada y asume conocimiento básico del tema.",
      advanced:
        "Puedes usar terminología técnica avanzada y conceptos complejos.",
      expert:
        "Puedes profundizar en detalles técnicos avanzados y conceptos especializados.",
    };

    return (
      expertiseMap[profile.preferences.expertise.level] ||
      expertiseMap.intermediate
    );
  }

  /**
   * Genera contexto del usuario
   */
  private generateUserContext(profile: UserProfile): string {
    const context = [];

    if (profile.context.profession) {
      context.push(`Profesión: ${profile.context.profession}`);
    }
    if (profile.context.interests && profile.context.interests.length > 0) {
      context.push(`Intereses: ${profile.context.interests.join(", ")}`);
    }
    if (profile.context.goals && profile.context.goals.length > 0) {
      context.push(`Objetivos: ${profile.context.goals.join(", ")}`);
    }
    if (
      profile.preferences.expertise.domains &&
      profile.preferences.expertise.domains.length > 0
    ) {
      context.push(
        `Áreas de expertise: ${profile.preferences.expertise.domains.join(
          ", "
        )}`
      );
    }

    return context.length > 0
      ? context.join("\n")
      : "Sin contexto específico disponible";
  }

  /**
   * Limpia el historial de feedback antiguo
   */
  private cleanupFeedbackHistory(profile: UserProfile): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    profile.behavior.feedbackHistory = profile.behavior.feedbackHistory.filter(
      (feedback) => feedback.timestamp > thirtyDaysAgo
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

      // Si es un objeto con método text()
      if (result && typeof result.text === "function") {
        return await result.text();
      }

      // Si es un objeto con propiedad text
      if (result && typeof result.text === "string") {
        return result.text;
      }

      // Si es un objeto con propiedad content
      if (result && typeof result.content === "string") {
        return result.content;
      }

      // Si es un objeto con propiedad message
      if (
        result &&
        result.message &&
        typeof result.message.content === "string"
      ) {
        return result.message.content;
      }

      // Si es un array con mensajes
      if (Array.isArray(result) && result.length > 0) {
        const lastMessage = result[result.length - 1];
        if (lastMessage && typeof lastMessage.content === "string") {
          return lastMessage.content;
        }
      }

      console.warn("Unexpected result format:", typeof result, result);
      return "Error: No se pudo obtener el texto.";
    } catch (error) {
      console.error("Error getting text safely:", error);
      return "Error: No se pudo obtener el texto.";
    }
  }

  /**
   * Obtiene estadísticas del perfil
   */
  getProfileStats(userId: string): {
    totalInteractions: number;
    averageResponseLength: number;
    preferredStyle: string;
    commonTopics: string[];
  } {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return {
        totalInteractions: 0,
        averageResponseLength: 0,
        preferredStyle: "unknown",
        commonTopics: [],
      };
    }

    return {
      totalInteractions: profile.behavior.feedbackHistory.length,
      averageResponseLength: profile.behavior.averageMessageLength,
      preferredStyle: profile.preferences.communicationStyle,
      commonTopics: profile.context.interests || [],
    };
  }

  /**
   * Analiza si el mensaje del usuario tiene información suficiente para generar una respuesta personalizada
   */
  async analyzeContextCompleteness(
    userMessage: string,
    conversationHistory: any[] = [],
    userId: string
  ): Promise<ContextAnalysis> {
    try {
      const profile = await this.getUserProfile(userId);

      const analysisPrompt = `
Eres un analizador experto de contexto. Tu trabajo es determinar si el usuario ha proporcionado suficiente información para generar una respuesta personalizada y útil.

ANÁLISIS A REALIZAR:
1. Identificar el tipo de tarea (programación, fitness, dieta, negocios, escritura, general)
2. Determinar qué información clave falta
3. Generar preguntas específicas y concisas
4. Evaluar si hay suficiente contexto para proceder

TIPOS DE TAREAS Y DATOS CLAVE:

PROGRAMACIÓN:
- Lenguaje de programación
- Framework/biblioteca
- Propósito/funcionalidad
- Nivel de complejidad

FITNESS:
- Objetivo (fuerza, masa, salud, pérdida de peso)
- Experiencia actual
- Lesiones/limitaciones
- Días disponibles
- Ubicación (casa/gimnasio)

DIETA:
- Objetivo (pérdida, ganancia, mantenimiento)
- Calorías objetivo
- Alergias/restricciones
- Preferencias alimentarias
- Presupuesto

NEGOCIOS:
- Sector/industria
- Tipo de empresa
- Problema específico
- Recursos disponibles

ESCRITURA (CVs, cartas):
- Tipo de documento
- Puesto objetivo
- Experiencia relevante
- Información personal

INSTRUCCIONES:
- Si falta información crítica, genera 2-3 preguntas específicas
- Si hay suficiente contexto, indica que se puede proceder
- Sé conciso y directo
- Considera el historial de conversación y el perfil del usuario

PERFIL DEL USUARIO:
- Estilo de comunicación: ${
        profile.preferences.communicationStyle || "friendly"
      }
- Nivel de detalle: ${profile.preferences.detailLevel || "moderate"}
- Experiencia: ${profile.preferences.expertise.level || "intermediate"}
- Dominios: ${
        profile.preferences.expertise.domains &&
        profile.preferences.expertise.domains.length > 0
          ? profile.preferences.expertise.domains.join(", ")
          : "No especificados"
      }

RESPONDE EN FORMATO JSON:
{
  "hasCompleteInfo": boolean,
  "missingInfo": ["info1", "info2"],
  "suggestedQuestions": ["pregunta1", "pregunta2"],
  "contextType": "programming|fitness|diet|business|writing|general",
  "confidence": 0.0-1.0,
  "shouldAskQuestions": boolean
}

Mensaje del usuario: "${userMessage}"

Historial de conversación (últimos 5 mensajes):
${conversationHistory
  .slice(-5)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

JSON:`;

      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content:
              "Eres un analizador experto de contexto. Responde SOLO en formato JSON válido.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        maxTokens: 500,
        temperature: 0.1,
      });

      const textResult = await this.getTextSafely(result);

      // Verificar si el resultado es un error
      if (textResult.startsWith("Error:")) {
        console.warn("AI analysis failed, using fallback:", textResult);
        return {
          hasCompleteInfo: false,
          missingInfo: ["información específica"],
          suggestedQuestions: [
            "¿Podrías proporcionar más detalles sobre lo que necesitas?",
          ],
          contextType: "general",
          confidence: 0.5,
          shouldAskQuestions: true,
        };
      }

      let cleanJson = textResult.trim();

      // Limpiar JSON si tiene markdown
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const analysis: ContextAnalysis = JSON.parse(cleanJson);

      // Determinar si debe hacer preguntas basado en la confianza y información faltante
      analysis.shouldAskQuestions =
        !analysis.hasCompleteInfo && analysis.confidence > 0.3;

      return analysis;
    } catch (error) {
      console.error("Error analyzing context completeness:", error);

      // Fallback: análisis básico
      return {
        hasCompleteInfo: false,
        missingInfo: ["información específica"],
        suggestedQuestions: [
          "¿Podrías proporcionar más detalles sobre lo que necesitas?",
        ],
        contextType: "general",
        confidence: 0.5,
        shouldAskQuestions: true,
      };
    }
  }

  /**
   * Genera preguntas estratégicas basadas en el tipo de contexto
   */
  generateStrategicQuestions(
    contextType: string,
    missingInfo: string[],
    profile: UserProfile
  ): string[] {
    const questionTemplates = {
      programming: {
        language: "¿En qué lenguaje de programación necesitas ayuda?",
        framework: "¿Qué framework o biblioteca estás usando?",
        purpose: "¿Qué quieres que haga tu código específicamente?",
        complexity: "¿Es para un proyecto simple, intermedio o avanzado?",
      },
      fitness: {
        goal: "¿Cuál es tu objetivo principal? (fuerza, masa muscular, pérdida de peso, salud general)",
        experience: "¿Cuál es tu nivel de experiencia actual?",
        injuries: "¿Tienes alguna lesión o limitación física?",
        daysAvailable: "¿Cuántos días a la semana puedes entrenar?",
        location: "¿Entrenarás en casa o en gimnasio?",
      },
      diet: {
        goal: "¿Cuál es tu objetivo? (pérdida de peso, ganancia muscular, mantenimiento)",
        calories: "¿Cuántas calorías quieres consumir diariamente?",
        allergies: "¿Tienes alguna alergia o restricción alimentaria?",
        preferences: "¿Hay alimentos que prefieres o evitas?",
        budget: "¿Cuál es tu presupuesto semanal para comida?",
      },
      business: {
        sector: "¿En qué sector o industria trabajas?",
        companyType:
          "¿Qué tipo de empresa tienes? (startup, pyme, corporación)",
        problem: "¿Cuál es el problema específico que quieres resolver?",
        resources:
          "¿Qué recursos tienes disponibles? (tiempo, presupuesto, personal)",
      },
      writing: {
        documentType:
          "¿Qué tipo de documento necesitas? (CV, carta de presentación, propuesta)",
        targetRole: "¿Para qué puesto o empresa estás aplicando?",
        experience: "¿Cuál es tu experiencia relevante?",
        personalInfo:
          "¿Tienes alguna información personal específica que incluir?",
      },
    };

    const templates =
      questionTemplates[contextType as keyof typeof questionTemplates] || {};
    const questions = (missingInfo || []).map(
      (info) =>
        templates[info as keyof typeof templates] ||
        `¿Podrías especificar sobre ${info}?`
    );

    // Adaptar preguntas al estilo de comunicación del usuario
    return questions.map((q) => this.adaptQuestionToUserStyle(q, profile));
  }

  /**
   * Adapta las preguntas al estilo de comunicación del usuario
   */
  private adaptQuestionToUserStyle(
    question: string,
    profile: UserProfile
  ): string {
    const style = profile.preferences.communicationStyle;

    switch (style) {
      case "formal":
        return question.replace("¿", "¿Podría indicarme ").replace("?", "?");
      case "casual":
        return question.replace("¿", "¿Oye, ").replace("?", "?");
      case "technical":
        return question.replace("¿", "¿Especifique ").replace("?", "?");
      case "concise":
        return question.replace("¿", "¿").replace("?", "? (breve)");
      default:
        return question;
    }
  }

  /**
   * Genera un prompt adaptativo que incluye instrucciones de contexto
   */
  async generateAdaptivePrompt(
    userId: string,
    basePrompt: string,
    contextAnalysis: ContextAnalysis,
    conversationHistory: any[]
  ): Promise<string> {
    const profile = await this.getUserProfile(userId);

    let adaptivePrompt = basePrompt;

    // Agregar instrucciones de contexto si es necesario
    if (contextAnalysis.shouldAskQuestions) {
      adaptivePrompt += `

INSTRUCCIONES DE CONTEXTO:
- El usuario NO ha proporcionado información suficiente para generar una respuesta personalizada
- Tipo de contexto detectado: ${contextAnalysis.contextType}
- Información faltante: ${contextAnalysis.missingInfo.join(", ")}
- Confianza del análisis: ${Math.round(contextAnalysis.confidence * 100)}%

ACCIÓN REQUERIDA:
1. Haz las siguientes preguntas específicas de forma amigable:
${contextAnalysis.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

2. NO generes una respuesta completa hasta tener toda la información necesaria
3. Sé paciente y guía al usuario paso a paso
4. Adapta tu tono al estilo de comunicación del usuario: ${
        profile.preferences.communicationStyle
      }`;
    } else {
      adaptivePrompt += `

INSTRUCCIONES DE CONTEXTO:
- El usuario ha proporcionado información suficiente
- Tipo de contexto: ${contextAnalysis.contextType}
- Confianza del análisis: ${Math.round(contextAnalysis.confidence * 100)}%
- Procede a generar una respuesta personalizada y completa`;
    }

    return adaptivePrompt;
  }
}

export const userPersonalization = UserPersonalization.getInstance();

export type UserPlan = "free" | "plus" | "pro";

export interface PlanLimits {
  maxMessagesPerDay: number;
  maxFileSize: number; // en bytes
  maxFilesPerMessage: number;
  allowedModels: string[];
  canAnalyzeImages: boolean;
  canGenerateFiles: boolean;
  allowedFileTypes: string[];
  maxFileGenerationSize: number; // en bytes
  canUseAPI: boolean;
  canUseAdvancedFeatures: boolean;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxMessagesPerDay: 5,
    maxFileSize: 5 * 1024 * 1024, // 5MB (como se muestra en pricing)
    maxFilesPerMessage: 1,
    allowedModels: ["gpt-3.5-turbo"],
    canAnalyzeImages: false,
    canGenerateFiles: false,
    allowedFileTypes: [],
    maxFileGenerationSize: 0,
    canUseAPI: false,
    canUseAdvancedFeatures: false,
  },
  plus: {
    maxMessagesPerDay: -1, // ilimitado (como se muestra en pricing)
    maxFileSize: 50 * 1024 * 1024, // 50MB (como se muestra en pricing)
    maxFilesPerMessage: 5,
    allowedModels: ["gpt-3.5-turbo", "gpt-4o"],
    canAnalyzeImages: true,
    canGenerateFiles: true,
    allowedFileTypes: ["pdf", "txt", "image", "md"],
    maxFileGenerationSize: 10 * 1024 * 1024, // 10MB
    canUseAPI: false,
    canUseAdvancedFeatures: false,
  },
  pro: {
    maxMessagesPerDay: -1, // ilimitado
    maxFileSize: 500 * 1024 * 1024, // 500MB (como se muestra en pricing)
    maxFilesPerMessage: 10,
    allowedModels: ["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"],
    canAnalyzeImages: true,
    canGenerateFiles: true,
    allowedFileTypes: [
      "pdf",
      "excel",
      "xlsx",
      "docx",
      "word",
      "json",
      "csv",
      "txt",
      "md",
      "image",
    ],
    maxFileGenerationSize: 50 * 1024 * 1024, // 50MB
    canUseAPI: true,
    canUseAdvancedFeatures: true,
  },
};

export function getUserPlan(user: any): UserPlan {
  // Aquí puedes integrar con tu sistema de pagos (Stripe, etc.)
  // Por ahora, asumimos que el usuario tiene plan "free" por defecto
  return user?.plan || "free";
}

export function getPlanLimits(user: any): PlanLimits {
  const plan = getUserPlan(user);
  return PLAN_LIMITS[plan];
}

export function canUseModel(user: any, model: string): boolean {
  const limits = getPlanLimits(user);
  return limits.allowedModels.includes(model);
}

export function canAnalyzeImages(user: any): boolean {
  const limits = getPlanLimits(user);
  return limits.canAnalyzeImages;
}

export function canGenerateFiles(user: any): boolean {
  const limits = getPlanLimits(user);
  return limits.canGenerateFiles;
}

export function canGenerateFileType(user: any, fileType: string): boolean {
  const limits = getPlanLimits(user);
  return limits.allowedFileTypes.includes(fileType.toLowerCase());
}

export function validateFileSize(user: any, fileSize: number): boolean {
  const limits = getPlanLimits(user);
  return fileSize <= limits.maxFileSize;
}

export function validateFileCount(user: any, fileCount: number): boolean {
  const limits = getPlanLimits(user);
  return fileCount <= limits.maxFilesPerMessage;
}

export function getUpgradeMessage(
  currentPlan: UserPlan,
  feature: string
): string {
  const messages = {
    free: {
      images: "Análisis de imágenes requiere plan Plus o superior.",
      files: "Análisis de archivos requiere plan Plus o superior.",
      gpt4: "GPT-4 requiere plan Plus o superior.",
      excel: "Generación de Excel requiere plan Pro.",
      api: "API requiere plan Pro.",
    },
    plus: {
      excel: "Generación de Excel requiere plan Pro.",
      docx: "Generación de DOCX requiere plan Pro.",
      api: "API requiere plan Pro.",
    },
    pro: {
      excel: "Generación de Excel disponible.",
      docx: "Generación de DOCX disponible.",
      api: "API disponible.",
    },
  };

  // Corregido: Aseguramos tipado y acceso seguro a las claves
  if (
    messages.hasOwnProperty(currentPlan) &&
    Object.prototype.hasOwnProperty.call(
      messages[currentPlan as keyof typeof messages],
      feature
    )
  ) {
    // @ts-expect-error: El acceso está controlado por la comprobación anterior
    return messages[currentPlan][feature];
  }
  return "Esta función requiere un plan superior. ¿Te gustaría actualizar?";
}

export function generateSystemPrompt(user: any): string {
  const userPlan = getUserPlan(user);

  const basePrompt = `Eres una IA conversacional avanzada y profesional. El usuario actual tiene el plan: **${userPlan.toUpperCase()}**.

## 🎯 INSTRUCCIONES DE FORMATO
**SIEMPRE** estructura tus respuestas de forma visual y atractiva usando:

### 📝 Elementos de Formato Requeridos:
- **Títulos grandes** (# ## ###) para secciones principales
- **Separadores** (---) entre secciones importantes
- **Listas numeradas** y con viñetas para puntos clave
- **Emojis relevantes** para hacer el contenido más atractivo
- **Bloques de código** (\`\`\`language) cuando sea apropiado
- **Citas** (>) para consejos o información importante
- **Tablas** para datos estructurados
- **Alertas** usando "Tip:", "¡Atención!", "✅", "❌" para información especial

### 🎨 Ejemplo de Estructura:
\`\`\`markdown
# 🚀 Título Principal

---

## 📋 Sección Importante
- Punto clave 1
- Punto clave 2

---

### 💡 Tip: Consejo Útil
Información importante en formato de alerta.

---

\`\`\`javascript
// Ejemplo de código
console.log("Hola mundo");
\`\`\`

---

## 📊 Datos en Tabla
| Columna 1 | Columna 2 |
|-----------|-----------|
| Dato 1    | Dato 2    |

---

> **Nota:** Siempre responde en español y usa esta estructura visual.

## 🔒 Limitaciones por Plan:

${
  userPlan === "free"
    ? `
### Plan GRATIS:
- Solo puedes usar GPT-3.5-turbo
- No puedes analizar imágenes
- No puedes generar archivos (PDF, Excel, etc.)
- Máximo 5 mensajes por día
- Si el usuario pide funciones premium, responde amablemente invitando a actualizar

**Ejemplo de respuesta para función premium:**
> 💡 **Tip:** Para generar archivos PDF necesitas actualizar a Plus o Pro. ¿Te gustaría conocer los beneficios?
`
    : userPlan === "plus"
    ? `
### Plan PLUS:
- Puedes usar GPT-4o
- Puedes analizar imágenes
- Puedes generar archivos básicos (PDF, TXT, imágenes)
- No puedes generar archivos avanzados (Excel, DOCX, JSON grandes)
- Si pide Excel/DOCX, sugiere actualizar a Pro

**Ejemplo de respuesta para función Pro:**
> 💡 **Tip:** Para generar archivos Excel avanzados necesitas el plan Pro. ¿Te gustaría actualizar tu plan?
`
    : `
### Plan PRO:
- Acceso total a todos los modelos
- Puedes analizar y generar cualquier tipo de archivo
- Sin limitaciones de uso
- Funciones avanzadas habilitadas
`
}

## 🎯 Objetivo:
Proporciona respuestas **visualmente atractivas**, **estructuradas** y **profesionales** que parezcan de una IA premium como ChatGPT Plus. Usa siempre el formato enriquecido y las limitaciones de plan correspondientes.`;

  return basePrompt;
}

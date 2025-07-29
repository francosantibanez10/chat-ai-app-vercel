import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface MathProblem {
  id: string;
  type:
    | "arithmetic"
    | "algebra"
    | "geometry"
    | "calculus"
    | "statistics"
    | "logic";
  difficulty: "easy" | "medium" | "hard" | "expert";
  problem: string;
  solution: string;
  steps: MathStep[];
  visualization?: string;
  relatedConcepts: string[];
}

export interface MathStep {
  stepNumber: number;
  description: string;
  calculation: string;
  result: string;
  explanation: string;
}

export interface MathAnalysis {
  problemType: string;
  difficulty: number; // 0-1
  requiredConcepts: string[];
  estimatedTime: number; // seconds
  canVisualize: boolean;
  hasMultipleSolutions: boolean;
}

export interface MathVisualization {
  type: "graph" | "diagram" | "chart" | "table";
  data: any;
  description: string;
  mermaidCode?: string;
}

export class MathSolver {
  private static instance: MathSolver;
  private problemHistory: Map<string, MathProblem[]> = new Map();
  private userMathLevel: Map<string, number> = new Map(); // 0-1 scale

  private constructor() {}

  static getInstance(): MathSolver {
    if (!MathSolver.instance) {
      MathSolver.instance = new MathSolver();
    }
    return MathSolver.instance;
  }

  /**
   * Analiza un problema matemático
   */
  async analyzeMathProblem(
    problem: string,
    userId: string
  ): Promise<MathAnalysis> {
    const analysisPrompt = `
Analiza el siguiente problema matemático:

Problema: "${problem}"

Proporciona:
1. Tipo de problema (aritmética, álgebra, geometría, cálculo, estadística, lógica)
2. Dificultad (0-1, donde 0 es muy fácil y 1 es muy difícil)
3. Conceptos matemáticos requeridos
4. Tiempo estimado de resolución en segundos
5. Si se puede visualizar (gráfico, diagrama, etc.)
6. Si tiene múltiples soluciones

Responde con JSON:
{
  "problemType": "algebra",
  "difficulty": 0.7,
  "requiredConcepts": ["ecuaciones cuadráticas", "factorización"],
  "estimatedTime": 120,
  "canVisualize": true,
  "hasMultipleSolutions": false
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.1,
        maxTokens: 300,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const analysis: MathAnalysis = JSON.parse(cleanJson);

      // Actualizar nivel matemático del usuario
      this.updateUserMathLevel(userId, analysis.difficulty);

      return analysis;
    } catch (error) {
      console.error("Error analyzing math problem:", error);
      return {
        problemType: "arithmetic",
        difficulty: 0.5,
        requiredConcepts: ["operaciones básicas"],
        estimatedTime: 60,
        canVisualize: false,
        hasMultipleSolutions: false,
      };
    }
  }

  /**
   * Resuelve un problema matemático paso a paso
   */
  async solveMathProblem(
    problem: string,
    userId: string,
    showSteps: boolean = true
  ): Promise<MathProblem> {
    const userLevel = this.getUserMathLevel(userId);
    const analysis = await this.analyzeMathProblem(problem, userId);

    const solvePrompt = `
Resuelve el siguiente problema matemático paso a paso:

Problema: "${problem}"

Tipo: ${analysis.problemType}
Dificultad: ${analysis.difficulty}
Conceptos requeridos: ${analysis.requiredConcepts.join(", ")}

Nivel del usuario: ${userLevel} (0-1, donde 0 es principiante y 1 es experto)

INSTRUCCIONES:
1. Resuelve el problema paso a paso
2. Explica cada paso de forma clara
3. Adapta la explicación al nivel del usuario
4. Si es posible, incluye visualización
5. Menciona conceptos relacionados

Responde con JSON:
{
  "id": "math_${Date.now()}",
  "type": "${analysis.problemType}",
  "difficulty": "${
    analysis.difficulty > 0.7
      ? "hard"
      : analysis.difficulty > 0.4
      ? "medium"
      : "easy"
  }",
  "problem": "${problem}",
  "solution": "solución final",
  "steps": [
    {
      "stepNumber": 1,
      "description": "descripción del paso",
      "calculation": "cálculo realizado",
      "result": "resultado del paso",
      "explanation": "explicación detallada"
    }
  ],
  "visualization": "descripción de visualización si aplica",
  "relatedConcepts": ["concepto1", "concepto2"]
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: solvePrompt }],
        temperature: 0.1,
        maxTokens: 2000,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const mathProblem: MathProblem = JSON.parse(cleanJson);

      // Guardar en historial
      this.saveToHistory(userId, mathProblem);

      return mathProblem;
    } catch (error) {
      console.error("Error solving math problem:", error);
      throw new Error("No se pudo resolver el problema matemático");
    }
  }

  /**
   * Genera visualización matemática
   */
  async generateVisualization(
    problem: MathProblem
  ): Promise<MathVisualization | null> {
    if (!problem.visualization) return null;

    const vizPrompt = `
Genera una visualización para el siguiente problema matemático:

Problema: ${problem.problem}
Tipo: ${problem.type}
Solución: ${problem.solution}

Crea una visualización apropiada (gráfico, diagrama, tabla, etc.)

Responde con JSON:
{
  "type": "graph|diagram|chart|table",
  "data": {...},
  "description": "descripción de la visualización",
  "mermaidCode": "código mermaid si aplica"
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: vizPrompt }],
        temperature: 0.3,
        maxTokens: 500,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error generating visualization:", error);
      return null;
    }
  }

  /**
   * Genera problemas de práctica
   */
  async generatePracticeProblems(
    topic: string,
    difficulty: "easy" | "medium" | "hard",
    count: number = 5,
    userId: string
  ): Promise<MathProblem[]> {
    const userLevel = this.getUserMathLevel(userId);

    const practicePrompt = `
Genera ${count} problemas de práctica de ${topic} con dificultad ${difficulty}.

Nivel del usuario: ${userLevel}

Los problemas deben:
1. Ser apropiados para el nivel del usuario
2. Cubrir diferentes aspectos del tema
3. Tener soluciones claras
4. Incluir explicaciones paso a paso

Responde con JSON array:
[
  {
    "id": "practice_1",
    "type": "algebra",
    "difficulty": "medium",
    "problem": "enunciado del problema",
    "solution": "solución final",
    "steps": [...],
    "relatedConcepts": [...]
  }
]`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: practicePrompt }],
        temperature: 0.3,
        maxTokens: 3000,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const problems: MathProblem[] = JSON.parse(cleanJson);

      // Guardar problemas en historial
      problems.forEach((problem) => this.saveToHistory(userId, problem));

      return problems;
    } catch (error) {
      console.error("Error generating practice problems:", error);
      return [];
    }
  }

  /**
   * Verifica si una respuesta matemática es correcta
   */
  async verifyMathAnswer(
    problem: string,
    userAnswer: string,
    correctAnswer: string
  ): Promise<{
    isCorrect: boolean;
    confidence: number;
    feedback: string;
    explanation: string;
  }> {
    const verifyPrompt = `
Verifica si la respuesta del usuario es correcta:

Problema: "${problem}"
Respuesta correcta: "${correctAnswer}"
Respuesta del usuario: "${userAnswer}"

Evalúa:
1. Si la respuesta es correcta
2. Nivel de confianza (0-1)
3. Feedback constructivo
4. Explicación de por qué es correcta o incorrecta

Responde con JSON:
{
  "isCorrect": true,
  "confidence": 0.95,
  "feedback": "Excelente trabajo! Tu respuesta es correcta.",
  "explanation": "Explicación detallada..."
}`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: verifyPrompt }],
        temperature: 0.1,
        maxTokens: 500,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error verifying math answer:", error);
      return {
        isCorrect: false,
        confidence: 0.5,
        feedback: "No se pudo verificar la respuesta",
        explanation: "Error en el sistema de verificación",
      };
    }
  }

  private updateUserMathLevel(userId: string, difficulty: number): void {
    const currentLevel = this.userMathLevel.get(userId) || 0.5;
    const newLevel = (currentLevel + difficulty) / 2;
    this.userMathLevel.set(userId, Math.min(1, Math.max(0, newLevel)));
  }

  private getUserMathLevel(userId: string): number {
    return this.userMathLevel.get(userId) || 0.5;
  }

  private saveToHistory(userId: string, problem: MathProblem): void {
    if (!this.problemHistory.has(userId)) {
      this.problemHistory.set(userId, []);
    }
    this.problemHistory.get(userId)!.push(problem);
  }

  private async getTextSafely(result: any): Promise<string> {
    try {
      return await result.text;
    } catch (error) {
      console.error("Error getting text from result:", error);
      return "Error processing result";
    }
  }

  getUserMathHistory(userId: string, limit: number = 20): MathProblem[] {
    const history = this.problemHistory.get(userId) || [];
    return history.slice(-limit);
  }

  getUserMathStats(userId: string): {
    totalProblems: number;
    averageDifficulty: number;
    favoriteTopics: string[];
    improvementRate: number;
  } {
    const history = this.problemHistory.get(userId) || [];
    const totalProblems = history.length;
    const averageDifficulty =
      history.reduce((sum, p) => {
        const diff =
          p.difficulty === "easy" ? 0.3 : p.difficulty === "medium" ? 0.6 : 0.9;
        return sum + diff;
      }, 0) / totalProblems;

    const topics = history.flatMap((p) => p.relatedConcepts);
    const topicCount = topics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTopics = Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      totalProblems,
      averageDifficulty,
      favoriteTopics,
      improvementRate: this.getUserMathLevel(userId),
    };
  }
}

export const mathSolver = MathSolver.getInstance();

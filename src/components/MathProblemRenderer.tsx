"use client";

import { useState } from "react";
import { CheckCircle, Play, Eye, BookOpen, Target, Clock } from "lucide-react";

interface MathStep {
  stepNumber: number;
  description: string;
  calculation: string;
  result: string;
  explanation: string;
}

interface MathProblem {
  id: string;
  type: string;
  difficulty: string;
  problem: string;
  solution: string;
  steps: MathStep[];
  visualization?: string;
  relatedConcepts: string[];
}

interface MathProblemRendererProps {
  problem: MathProblem;
  showSteps?: boolean;
  showVisualization?: boolean;
}

export default function MathProblemRenderer({
  problem,
  showSteps = true,
  showVisualization = true,
}: MathProblemRendererProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [showFullSolution, setShowFullSolution] = useState(false);

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/10";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "hard":
        return "text-orange-400 bg-orange-400/10";
      case "expert":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "algebra":
        return "x²";
      case "geometry":
        return "△";
      case "calculus":
        return "∫";
      case "statistics":
        return "📊";
      case "arithmetic":
        return "🔢";
      default:
        return "🧮";
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon(problem.type)}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Problema de {problem.type}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>~{problem.steps.length * 2} min</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFullSolution(!showFullSolution)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showFullSolution ? "Ocultar" : "Ver"} solución</span>
          </button>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-white font-medium mb-2">Enunciado:</h4>
            <p className="text-gray-300 leading-relaxed">{problem.problem}</p>
          </div>
        </div>
      </div>

      {/* Solution Steps */}
      {showSteps && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h4 className="text-white font-medium">Solución paso a paso:</h4>
          </div>
          
          <div className="space-y-2">
            {problem.steps.map((step, index) => (
              <div
                key={step.stepNumber}
                className="bg-gray-900/30 border border-gray-600 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {step.stepNumber}
                    </div>
                    <span className="text-white font-medium">{step.description}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {expandedSteps.has(step.stepNumber) ? (
                      <span className="text-gray-400">▼</span>
                    ) : (
                      <span className="text-gray-400">▶</span>
                    )}
                  </div>
                </button>
                
                {expandedSteps.has(step.stepNumber) && (
                  <div className="p-4 bg-gray-800/30 border-t border-gray-600 space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Cálculo:</span>
                      <div className="bg-gray-900/50 p-2 rounded mt-1 font-mono text-green-400">
                        {step.calculation}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Resultado:</span>
                      <div className="bg-blue-900/30 p-2 rounded mt-1 font-semibold text-blue-300">
                        {step.result}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Explicación:</span>
                      <p className="text-gray-300 mt-1 leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Solution */}
      {showFullSolution && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h4 className="text-white font-medium">Solución Final:</h4>
          </div>
          <div className="bg-green-900/30 p-3 rounded font-mono text-green-300 text-lg">
            {problem.solution}
          </div>
        </div>
      )}

      {/* Visualization */}
      {showVisualization && problem.visualization && (
        <div className="bg-gray-900/30 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Play className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-medium">Visualización:</h4>
          </div>
          <div className="bg-gray-800/50 p-3 rounded text-gray-300">
            {problem.visualization}
          </div>
        </div>
      )}

      {/* Related Concepts */}
      <div className="bg-gray-900/30 border border-gray-600 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Conceptos Relacionados:</h4>
        <div className="flex flex-wrap gap-2">
          {problem.relatedConcepts.map((concept, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-gray-300 transition-colors cursor-pointer"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
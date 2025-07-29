"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, FileImage, FileCode, ChevronDown, ChevronUp } from "lucide-react";

export default function FileGenerationHelp() {
  const [isExpanded, setIsExpanded] = useState(false);

  const examples = [
    {
      icon: <FileText className="w-5 h-5 text-red-500" />,
      title: "Generar PDF",
      examples: [
        "Hazme un PDF con un resumen ejecutivo",
        "Genera un PDF con las mejores prácticas de programación",
        "Crea un PDF con una guía de usuario"
      ]
    },
    {
      icon: <FileSpreadsheet className="w-5 h-5 text-green-500" />,
      title: "Generar Excel",
      examples: [
        "Hazme una tabla de gastos mensuales en Excel",
        "Genera una hoja de cálculo con datos de ventas",
        "Crea un Excel con un presupuesto anual"
      ]
    },
    {
      icon: <FileImage className="w-5 h-5 text-blue-500" />,
      title: "Generar Imágenes",
      examples: [
        "Genera una imagen de un perro astronauta",
        "Crea una imagen de un paisaje futurista",
        "Hazme una imagen de un logo minimalista"
      ]
    },
    {
      icon: <FileCode className="w-5 h-5 text-yellow-500" />,
      title: "Generar Archivos de Código",
      examples: [
        "Hazme un archivo JSON con datos de usuarios",
        "Genera un archivo CSV con estadísticas",
        "Crea un archivo de texto con notas importantes"
      ]
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">¿Qué archivos puedo generar?</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-300 text-sm">
            Puedes pedirle a Rubi que genere diferentes tipos de archivos. Solo pídele de forma natural:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {examples.map((category, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {category.icon}
                  <h4 className="text-white font-medium text-sm">{category.title}</h4>
                </div>
                <ul className="space-y-1">
                  {category.examples.map((example, exampleIndex) => (
                    <li key={exampleIndex} className="text-gray-300 text-xs">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              <strong>Tip:</strong> Rubi detectará automáticamente cuando quieres generar un archivo y te lo proporcionará para descargar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 
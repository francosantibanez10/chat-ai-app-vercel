"use client";

// import { SmartMessageRenderer } from "@/components/SmartMessageRenderer";

export default function TestRendererPage() {
  const testContent = `# Título Principal

Este es un párrafo normal con **texto en negrita** y *texto en cursiva*.

## Subtítulo

Aquí tienes una lista:

- Elemento 1
- Elemento 2
- Elemento 3

> 💡 **Tip**: Este es un consejo que debería aparecer como una card especial fuera de la burbuja principal.

Aquí tienes más contenido normal después del tip.

\`\`\`javascript
function ejemplo() {
  console.log("Este es un bloque de código");
}
\`\`\`

> ⚠️ **Advertencia**: Esta es una advertencia que también debería aparecer como card especial.

Y aquí tienes una tabla normal:

| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Dato 1    | Dato 2    | Dato 3    |
| Dato 4    | Dato 5    | Dato 6    |

> ✅ **Éxito**: Esta es una confirmación de éxito.

Finalmente, aquí tienes un blockquote normal que debería quedarse dentro de la burbuja:

> Este es un blockquote normal que no es un tip ni una alerta, por lo que debería aparecer dentro de la burbuja principal con el estilo de blockquote normal.

Y aquí tienes más contenido normal al final.`;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Prueba del SmartMessageRenderer
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Contenido de prueba:
          </h2>

          {/* <SmartMessageRenderer content={testContent} /> */}
          <pre className="text-white whitespace-pre-wrap">{testContent}</pre>
        </div>
      </div>
    </div>
  );
}

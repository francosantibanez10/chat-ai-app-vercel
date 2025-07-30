import React, { useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Copy, ExternalLink, Download, FileText, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface RichMessageRendererProps {
  content: string;
  className?: string;
  onExtractedBlocks?: (blocks: ExtractedBlock[]) => void;
  isStreaming?: boolean; // ✅ Nuevo prop para modo streaming
}

interface ExtractedBlock {
  type: "tip" | "warning" | "success" | "error" | "file";
  content: string;
  title?: string;
  originalText: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

// Parser para extraer bloques especiales del contenido
const extractSpecialBlocks = (
  content: string
): {
  mainContent: string;
  extractedBlocks: ExtractedBlock[];
} => {
  const lines = content.split("\n");
  const mainContentLines: string[] = [];
  const extractedBlocks: ExtractedBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Detectar bloques de consejos/tips
    if (
      line.startsWith("💡") ||
      line.startsWith("Tip:") ||
      line.startsWith("**Tip**") ||
      line.startsWith("Consejo:")
    ) {
      const tipContent: string[] = [];
      const originalText: string[] = [];

      // Agregar la línea actual
      tipContent.push(
        line.replace(/^(💡|Tip:|\\*\\*Tip\\*\\*|Consejo:)\s*/, "")
      );
      originalText.push(lines[i]);

      // Buscar contenido del tip hasta encontrar una línea vacía o separador
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (
          nextLine.trim() === "" ||
          nextLine.startsWith("---") ||
          nextLine.startsWith("***")
        ) {
          break;
        }
        tipContent.push(nextLine);
        originalText.push(nextLine);
        i++;
      }

      extractedBlocks.push({
        type: "tip",
        content: tipContent.join("\n").trim(),
        title: "Consejo",
        originalText: originalText.join("\n"),
      });

      // Agregar un marcador en el contenido principal
      mainContentLines.push(`[EXTRACTED_TIP_${extractedBlocks.length - 1}]`);
      continue;
    }

    // Detectar bloques de advertencia
    if (
      line.startsWith("⚠️") ||
      line.startsWith("¡Atención!") ||
      line.startsWith("**Warning**")
    ) {
      const warningContent: string[] = [];
      const originalText: string[] = [];

      warningContent.push(
        line.replace(/^(⚠️|¡Atención!|\\*\\*Warning\\*\\*)\s*/, "")
      );
      originalText.push(lines[i]);

      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (
          nextLine.trim() === "" ||
          nextLine.startsWith("---") ||
          nextLine.startsWith("***")
        ) {
          break;
        }
        warningContent.push(nextLine);
        originalText.push(nextLine);
        i++;
      }

      extractedBlocks.push({
        type: "warning",
        content: warningContent.join("\n").trim(),
        title: "Atención",
        originalText: originalText.join("\n"),
      });

      mainContentLines.push(
        `[EXTRACTED_WARNING_${extractedBlocks.length - 1}]`
      );
      continue;
    }

    // Detectar bloques de éxito
    if (
      line.startsWith("✅") ||
      line.startsWith("Éxito:") ||
      line.startsWith("**Success**")
    ) {
      const successContent: string[] = [];
      const originalText: string[] = [];

      successContent.push(
        line.replace(/^(✅|Éxito:|\\*\\*Success\\*\\*)\s*/, "")
      );
      originalText.push(lines[i]);

      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (
          nextLine.trim() === "" ||
          nextLine.startsWith("---") ||
          nextLine.startsWith("***")
        ) {
          break;
        }
        successContent.push(nextLine);
        originalText.push(nextLine);
        i++;
      }

      extractedBlocks.push({
        type: "success",
        content: successContent.join("\n").trim(),
        title: "Éxito",
        originalText: originalText.join("\n"),
      });

      mainContentLines.push(
        `[EXTRACTED_SUCCESS_${extractedBlocks.length - 1}]`
      );
      continue;
    }

    // Detectar bloques de error
    if (
      line.startsWith("❌") ||
      line.startsWith("Error:") ||
      line.startsWith("**Error**")
    ) {
      const errorContent: string[] = [];
      const originalText: string[] = [];

      errorContent.push(line.replace(/^(❌|Error:|\\*\\*Error\\*\\*)\s*/, ""));
      originalText.push(lines[i]);

      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (
          nextLine.trim() === "" ||
          nextLine.startsWith("---") ||
          nextLine.startsWith("***")
        ) {
          break;
        }
        errorContent.push(nextLine);
        originalText.push(nextLine);
        i++;
      }

      extractedBlocks.push({
        type: "error",
        content: errorContent.join("\n").trim(),
        title: "Error",
        originalText: originalText.join("\n"),
      });

      mainContentLines.push(`[EXTRACTED_ERROR_${extractedBlocks.length - 1}]`);
      continue;
    }

    // Detectar archivos generados
    if (line.includes("[type:") && line.includes("]")) {
      const match = line.match(/\[type:(.+?)\]/);
      if (match) {
        const fileType = match[1];
        extractedBlocks.push({
          type: "file",
          content: line,
          title: `Archivo ${fileType.toUpperCase()}`,
          originalText: line,
        });

        mainContentLines.push(`[EXTRACTED_FILE_${extractedBlocks.length - 1}]`);
        i++;
        continue;
      }
    }

    // Línea normal, agregar al contenido principal
    mainContentLines.push(lines[i]);
    i++;
  }

  return {
    mainContent: mainContentLines.join("\n"),
    extractedBlocks,
  };
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
  filename,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el código");
    }
  };

  return (
    <div className="my-6 rounded-xl border border-gray-700 bg-gray-900/80 overflow-hidden shadow-lg">
      {filename && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <FileText size={16} />
            {filename}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={`h-8 px-3 rounded-md transition-all duration-200 flex items-center gap-2 ${
            copied
              ? "bg-green-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="text-xs">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="text-xs">Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-6 overflow-x-auto bg-gray-900">
        <code className={`language-${language} text-sm leading-relaxed`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const AlertBlock: React.FC<{
  type: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const icons = {
    info: "💡",
    tip: "💡",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  const variants = {
    info: "border-blue-500/30 bg-blue-500/15 text-blue-200 shadow-blue-500/10",
    tip: "border-blue-500/30 bg-blue-500/15 text-blue-200 shadow-blue-500/10",
    warning:
      "border-yellow-500/30 bg-yellow-500/15 text-yellow-200 shadow-yellow-500/10",
    success:
      "border-green-500/30 bg-green-500/15 text-green-200 shadow-green-500/10",
    error: "border-red-500/30 bg-red-500/15 text-red-200 shadow-red-500/10",
  };

  return (
    <div className={`my-6 p-6 rounded-xl border-2 shadow-lg ${variants[type]}`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-2 text-lg">{title}</h4>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

const FileDownloadBlock: React.FC<{
  filename: string;
  url?: string;
  type: string;
}> = ({ filename, url, type }) => {
  const handleDownload = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="my-6 p-6 rounded-xl border-2 border-gray-700 bg-gray-900/80 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Download className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{filename}</p>
            <p className="text-sm text-gray-400 mt-1">{type}</p>
          </div>
        </div>
        {url && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 flex items-center gap-2"
          >
            <ExternalLink size={16} className="mr-2" />
            Descargar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente para renderizar bloques extraídos de manera independiente
export const ExtractedBlockRenderer: React.FC<{ block: ExtractedBlock }> = ({
  block,
}) => {
  switch (block.type) {
    case "tip":
      return (
        <AlertBlock type="tip" title="Consejo">
          {block.content}
        </AlertBlock>
      );
    case "warning":
      return (
        <AlertBlock type="warning" title="Atención">
          {block.content}
        </AlertBlock>
      );
    case "success":
      return (
        <AlertBlock type="success" title="Éxito">
          {block.content}
        </AlertBlock>
      );
    case "error":
      return (
        <AlertBlock type="error" title="Error">
          {block.content}
        </AlertBlock>
      );
    case "file":
      const match = block.content.match(/\[type:(.+?)\]/);
      if (match) {
        const fileType = match[1];
        return (
          <FileDownloadBlock
            filename={`archivo.${fileType}`}
            type={fileType.toUpperCase()}
          />
        );
      }
      return null;
    default:
      return null;
  }
};

// Exportar la función de extracción para uso externo
export { extractSpecialBlocks };
export type { ExtractedBlock };

// Versión optimizada del RichMessageRenderer para streaming fluido
export const RichMessageRenderer = React.memo<RichMessageRendererProps>(
  ({ content, className = "", onExtractedBlocks, isStreaming = false }) => {
    // Verificar que el contenido sea una cadena válida
    if (typeof content !== "string") {
      console.warn("RichMessageRenderer recibió contenido no válido:", content);
      return (
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${className}`}
        >
          {String(content)}
        </div>
      );
    }

    // ✅ MODO STREAMING LIGERO: Renderizar texto plano durante streaming
    if (isStreaming) {
      return (
        <pre className={`whitespace-pre-wrap text-gray-100 ${className}`}>
          {content}
        </pre>
      );
    }

    // ✅ MEMOIZACIÓN AGRESIVA: Solo procesar si el contenido cambió significativamente
    const processedContent = useMemo(() => {
      return extractSpecialBlocks(content);
    }, [content]); // Solo re-procesar si content cambia

    const { mainContent, extractedBlocks } = processedContent;

    // ✅ CALLBACK MEMOIZADO: Evitar re-crear la función en cada render
    const handleExtractedBlocks = useCallback(() => {
      if (onExtractedBlocks) {
        onExtractedBlocks(extractedBlocks);
      }
    }, [onExtractedBlocks, extractedBlocks]);

    // Llamar a la función de callback si está presente (solo cuando no está streaming)
    React.useEffect(() => {
      if (!isStreaming && extractedBlocks.length > 0) {
        handleExtractedBlocks();
      }
    }, [handleExtractedBlocks, isStreaming, extractedBlocks.length]);

    // ✅ FUNCIÓN MEMOIZADA: Evitar re-crear extractCleanText en cada render
    const extractCleanText = useCallback((children: any): string => {
      if (typeof children === "string") {
        return children;
      }
      if (Array.isArray(children)) {
        return children.map((child) => extractCleanText(child)).join("");
      }
      if (children && typeof children === "object" && children.props) {
        return extractCleanText(children.props.children);
      }
      return String(children);
    }, []);

    // ✅ MEMOIZAR COMPONENTES: Evitar re-crear componentes en cada render
    const markdownComponents = useMemo(
      () => ({
        // Títulos con jerarquía visual premium
        h1: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h1
            className="text-3xl font-bold mt-8 mb-6 text-white border-b border-gray-700 pb-3 leading-tight"
            {...props}
          />
        ),
        h2: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h2
            className="text-2xl font-semibold mt-6 mb-4 text-white leading-tight"
            {...props}
          />
        ),
        h3: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h3
            className="text-xl font-medium mt-5 mb-3 text-white leading-tight"
            {...props}
          />
        ),
        h4: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h4
            className="text-lg font-medium mt-4 mb-2 text-white leading-tight"
            {...props}
          />
        ),
        h5: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h5
            className="text-base font-medium mt-3 mb-2 text-white leading-tight"
            {...props}
          />
        ),
        h6: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <h6
            className="text-sm font-medium mt-2 mb-1 text-white leading-tight"
            {...props}
          />
        ),

        // Separadores elegantes
        hr: () => <hr className="separator-premium" />,

        // Listas con mejor espaciado y jerarquía
        ul: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <ul className="space-y-3 my-6 list-disc list-inside" {...props} />
        ),
        ol: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <ol className="space-y-3 my-6 list-decimal list-inside" {...props} />
        ),
        li: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <li className="leading-relaxed mb-2 text-gray-100" {...props} />
        ),

        // Código inline mejorado
        code: ({ node, className, children, ...props }: any) => {
          const isInline = !className?.includes("language-");

          if (isInline) {
            return (
              <code
                className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return null; // Los bloques de código se manejan por separado
        },

        // Enlaces con iconos y mejor estilo
        a: ({
          node,
          href,
          children,
          ...props
        }: {
          node?: any;
          href?: string;
          children?: any;
          [key: string]: any;
        }) => {
          // Solo renderizar como enlace si tiene href válido
          if (!href || href === "#" || href.startsWith("javascript:")) {
            return <span className="text-gray-300">{children}</span>;
          }

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 transition-colors"
              {...props}
            >
              {children}
              <ExternalLink size={12} />
            </a>
          );
        },

        // Tablas premium con mejor diseño
        table: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <div className="my-6 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-700 rounded-lg shadow-lg">
                <table
                  className="min-w-full divide-y divide-gray-700"
                  {...props}
                />
              </div>
            </div>
          </div>
        ),
        thead: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <thead className="bg-gray-800" {...props} />
        ),
        tbody: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <tbody className="divide-y divide-gray-700" {...props} />
        ),
        tr: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <tr className="hover:bg-gray-800/50 transition-colors" {...props} />
        ),
        th: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <th
            className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider"
            {...props}
          />
        ),
        td: ({ node, ...props }: { node?: any; [key: string]: any }) => (
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
            {...props}
          />
        ),

        // Citas elegantes con mejor diseño
        blockquote: ({
          node,
          ...props
        }: {
          node?: any;
          [key: string]: any;
        }) => (
          <blockquote
            className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-blue-500/10 rounded-r-lg"
            {...props}
          />
        ),

        // Párrafos con mejor espaciado
        p: ({ node, ...props }: { node?: any; [key: string]: any }) => {
          const cleanText = extractCleanText(props.children);

          // Detectar archivos generados
          if (cleanText.includes("[type:") && cleanText.includes("]")) {
            const match = cleanText.match(/\[type:(.+?)\]/);
            if (match) {
              const fileType = match[1];
              return (
                <FileDownloadBlock
                  filename={`archivo.${fileType}`}
                  type={fileType.toUpperCase()}
                />
              );
            }
          }

          // Renderizar párrafo normal con estilo que evite enlaces no deseados
          return (
            <p className="my-4 leading-relaxed text-gray-100" {...props} />
          );
        },

        // Bloques de código premium
        pre: ({
          node,
          children,
          ...props
        }: {
          node?: any;
          children?: any;
          [key: string]: any;
        }) => {
          const codeElement = React.Children.toArray(children).find(
            (child) => React.isValidElement(child) && child.type === "code"
          ) as React.ReactElement<any>;

          if (codeElement) {
            const language =
              (codeElement.props as any)?.className?.replace("language-", "") ||
              "text";
            const code = (codeElement.props as any)?.children || "";

            return <CodeBlock code={code} language={language} />;
          }

          return (
            <pre
              className="p-6 bg-gray-900 rounded-xl overflow-x-auto shadow-lg"
              {...props}
            />
          );
        },
      }),
      [extractCleanText]
    ); // ✅ Memoizar con dependencias

    return (
      <div className={`prose-premium max-w-none space-y-6 ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={markdownComponents}
        >
          {mainContent}
        </ReactMarkdown>
      </div>
    );
  }
);

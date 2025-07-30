"use client";

import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  File,
} from "lucide-react";
import { useState } from "react";

interface GeneratedFileViewerProps {
  file: {
    buffer: ArrayBuffer;
    contentType: string;
    filename: string;
    isDownloadable: boolean;
  };
  onClose?: () => void;
}

export default function GeneratedFileViewer({
  file,
  onClose,
}: GeneratedFileViewerProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const getFileIcon = () => {
    const contentType = file.contentType.toLowerCase();

    if (contentType.includes("pdf")) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (
      contentType.includes("excel") ||
      contentType.includes("spreadsheet")
    ) {
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    } else if (contentType.includes("image")) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    } else if (
      contentType.includes("json") ||
      contentType.includes("text/plain")
    ) {
      return <FileCode className="w-8 h-8 text-yellow-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileTypeName = () => {
    const contentType = file.contentType.toLowerCase();

    if (contentType.includes("pdf")) {
      return "Documento PDF";
    } else if (
      contentType.includes("excel") ||
      contentType.includes("spreadsheet")
    ) {
      return "Hoja de cálculo Excel";
    } else if (
      contentType.includes("word") ||
      contentType.includes("document")
    ) {
      return "Documento Word";
    } else if (contentType.includes("image")) {
      return "Imagen";
    } else if (contentType.includes("json")) {
      return "Archivo JSON";
    } else if (contentType.includes("csv")) {
      return "Archivo CSV";
    } else if (contentType.includes("markdown")) {
      return "Documento Markdown";
    } else if (contentType.includes("text/plain")) {
      return "Archivo de texto";
    } else {
      return "Archivo";
    }
  };

  const handleDownload = () => {
    const blob = new Blob([file.buffer], { type: file.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (file.contentType.includes("image")) {
      setIsPreviewVisible(true);
    } else {
      // Para otros tipos de archivo, descargar directamente
      handleDownload();
    }
  };

  const canPreview = file.contentType.includes("image");

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div>
            <h3 className="text-white font-medium">{getFileTypeName()}</h3>
            <p className="text-gray-400 text-sm">{file.filename}</p>
            <p className="text-gray-500 text-xs">
              {(file.buffer.byteLength / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canPreview && (
            <button
              onClick={handlePreview}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center space-x-1"
            >
              <FileImage className="w-4 h-4" />
              <span>Vista previa</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1.5 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Modal de vista previa para imágenes */}
      {isPreviewVisible && file.contentType.includes("image") && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80]">
          <div className="bg-gray-900 rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Vista previa de imagen</h3>
              <button
                onClick={() => setIsPreviewVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <img
              src={URL.createObjectURL(
                new Blob([file.buffer], { type: file.contentType })
              )}
              alt="Vista previa"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

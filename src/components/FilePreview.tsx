"use client";

import { useState, useEffect } from "react";
import { X, FileText, Image, File } from "lucide-react";

interface FilePreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

export default function FilePreview({ files, onRemoveFile }: FilePreviewProps) {
  const [filePreviews, setFilePreviews] = useState<FileWithPreview[]>([]);

  // Procesar archivos para generar previews
  useEffect(() => {
    const processFiles = async () => {
      const previews: FileWithPreview[] = [];
      
      for (const file of files) {
        const type = file.type.startsWith('image/') ? 'image' : 
                     file.type.includes('document') || file.type.includes('text') ? 'document' : 'other';
        
        let preview: string | undefined;
        
        if (type === 'image') {
          preview = URL.createObjectURL(file);
        }
        
        previews.push({ file, preview, type });
      }
      
      setFilePreviews(previews);
    };

    processFiles();

    // Cleanup: revocar URLs de objetos cuando el componente se desmonte
    return () => {
      filePreviews.forEach(preview => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('document') || type.includes('text')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  if (files.length === 0) return null;

  return (
    <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">
          Archivos adjuntos ({files.length})
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filePreviews.map((filePreview, index) => (
          <div
            key={index}
            className="relative group bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors"
          >
            {/* Botón de eliminar */}
            <button
              onClick={() => onRemoveFile(index)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Preview del archivo */}
            <div className="flex flex-col items-center space-y-1">
              {filePreview.type === 'image' && filePreview.preview ? (
                <img
                  src={filePreview.preview}
                  alt={filePreview.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                  {getFileIcon(filePreview.file.type)}
                </div>
              )}
              
              <div className="text-center">
                <p className="text-xs text-gray-300 truncate max-w-[80px]">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(filePreview.file.size)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
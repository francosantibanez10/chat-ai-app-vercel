"use client";

import { useState, useRef } from "react";
import { X, FileText, Image, Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'other';
}

export default function FileUpload({ onFileSelect, onClose }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles: FilePreview[] = [];
    
    Array.from(files).forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' : 
                   file.type.includes('document') || file.type.includes('text') ? 'document' : 'other';
      
      const preview = type === 'image' ? URL.createObjectURL(file) : '';
      
      newFiles.push({
        file,
        preview,
        type
      });
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = () => {
    selectedFiles.forEach(filePreview => {
      onFileSelect(filePreview.file);
    });
    onClose();
  };

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
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200">Subir archivos</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? "border-gray-500 bg-gray-500 bg-opacity-10" 
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Soporta imágenes, documentos y otros archivos
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Seleccionar archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.md"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Archivos seleccionados ({selectedFiles.length})
              </h4>
              <div className="space-y-2">
                {selectedFiles.map((filePreview, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg"
                  >
                    {filePreview.type === 'image' ? (
                      <img
                        src={filePreview.preview}
                        alt={filePreview.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        {getFileIcon(filePreview.file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {filePreview.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(filePreview.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Subir al chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
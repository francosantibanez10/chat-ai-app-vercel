"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Image, FileText, X, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useChatInputStore } from "@/lib/chatInputStore";

interface FileDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: File) => void;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) {
    return Image;
  }
  if (file.type.includes("text") || file.type.includes("document")) {
    return FileText;
  }
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const { selectedFiles, addFile, removeFile, setUploading } =
    useChatInputStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile(file);
        if (onFileSelect) {
          onFileSelect(file);
        }
      });
    },
    [addFile, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "text/*": [".txt", ".md", ".json", ".csv"],
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: true,
    });

  const handleRemoveFile = (index: number) => {
    removeFile(index);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4 md:p-6 w-[95vw] md:w-[500px] md:max-w-[90vw] max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">Subir Archivos</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={clsx(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
              "hover:border-gray-500 hover:bg-gray-700/20",
              {
                "border-blue-500 bg-blue-500/10": isDragActive && !isDragReject,
                "border-red-500 bg-red-500/10": isDragReject,
                "border-gray-600": !isDragActive && !isDragReject,
              }
            )}
          >
            <input {...getInputProps()} />

            <motion.div
              animate={{
                scale: isDragActive ? 1.1 : 1,
                y: isDragActive ? -5 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <Upload
                className={clsx("w-12 h-12 mx-auto mb-4 transition-colors", {
                  "text-blue-400": isDragActive && !isDragReject,
                  "text-red-400": isDragReject,
                  "text-gray-400": !isDragActive && !isDragReject,
                })}
              />
            </motion.div>

            <p className="text-white font-medium mb-2">
              {isDragActive
                ? isDragReject
                  ? "Archivo no válido"
                  : "Suelta los archivos aquí"
                : "Arrastra archivos aquí o haz clic"}
            </p>

            <p className="text-gray-400 text-sm">
              PNG, JPG, PDF, DOC, TXT hasta 10MB
            </p>
          </div>

          {/* Archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">
                Archivos seleccionados
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const FileIcon = getFileIcon(file);
                  return (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">
                            {file.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        aria-label="Eliminar archivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              disabled={selectedFiles.length === 0}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "flex items-center space-x-2",
                {
                  "bg-blue-600 hover:bg-blue-700 text-white":
                    selectedFiles.length > 0,
                  "bg-gray-600 text-gray-400 cursor-not-allowed":
                    selectedFiles.length === 0,
                }
              )}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar ({selectedFiles.length})</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

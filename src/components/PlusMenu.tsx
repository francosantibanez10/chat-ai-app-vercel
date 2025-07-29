"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import FileUpload from "./FileUpload";

interface PlusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: File) => void;
  onOpenFileUpload?: () => void;
}

// Icono de subir archivos/imágenes
function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M4.33496 12.5V7.5C4.33496 7.13273 4.63273 6.83496 5 6.83496C5.36727 6.83496 5.66504 7.13273 5.66504 7.5V12.5C5.66504 14.8942 7.60585 16.835 10 16.835C12.3942 16.835 14.335 14.8942 14.335 12.5V5.83301C14.3348 4.35959 13.1404 3.16522 11.667 3.16504C10.1934 3.16504 8.99822 4.35948 8.99805 5.83301V12.5C8.99805 13.0532 9.44679 13.502 10 13.502C10.5532 13.502 11.002 13.0532 11.002 12.5V7.5C11.002 7.13273 11.2997 6.83496 11.667 6.83496C12.0341 6.83514 12.332 7.13284 12.332 7.5V12.5C12.332 13.7877 11.2877 14.832 10 14.832C8.71226 14.832 7.66797 13.7877 7.66797 12.5V5.83301C7.66814 3.62494 9.45888 1.83496 11.667 1.83496C13.875 1.83514 15.6649 3.62505 15.665 5.83301V12.5C15.665 15.6287 13.1287 18.165 10 18.165C6.87131 18.165 4.33496 15.6287 4.33496 12.5Z" />
    </svg>
  );
}

// Icono de aplicaciones
function AppsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.94556 14.0277C7.9455 12.9376 7.06204 12.054 5.97192 12.054C4.88191 12.0542 3.99835 12.9376 3.99829 14.0277C3.99829 15.1177 4.88188 16.0012 5.97192 16.0013C7.06207 16.0013 7.94556 15.1178 7.94556 14.0277ZM13.3625 16.6663V14.6927H11.3889C11.0216 14.6927 10.7239 14.3949 10.7239 14.0277C10.7239 13.6605 11.0217 13.3626 11.3889 13.3626H13.3625V11.389C13.3625 11.0218 13.6604 10.724 14.0276 10.724C14.3949 10.724 14.6926 11.0217 14.6926 11.389V13.3626H16.6663L16.801 13.3763C17.1038 13.4385 17.3312 13.7065 17.3313 14.0277C17.3313 14.3489 17.1038 14.6169 16.801 14.679L16.6663 14.6927H14.6926V16.6663C14.6926 17.0336 14.3949 17.3314 14.0276 17.3314C13.6604 17.3313 13.3625 17.0336 13.3625 16.6663ZM7.94556 5.97201C7.94544 4.88196 7.062 3.99837 5.97192 3.99837C4.88195 3.99849 3.99841 4.88203 3.99829 5.97201C3.99829 7.06208 4.88187 7.94552 5.97192 7.94564C7.06207 7.94564 7.94556 7.06216 7.94556 5.97201ZM16.0012 5.97201C16.0011 4.88196 15.1177 3.99837 14.0276 3.99837C12.9376 3.99843 12.0541 4.882 12.054 5.97201C12.054 7.06212 12.9375 7.94558 14.0276 7.94564C15.1177 7.94564 16.0012 7.06216 16.0012 5.97201ZM9.27563 14.0277C9.27563 15.8524 7.79661 17.3314 5.97192 17.3314C4.14734 17.3313 2.66821 15.8523 2.66821 14.0277C2.66827 12.2031 4.14737 10.7241 5.97192 10.724C7.79657 10.724 9.27558 12.203 9.27563 14.0277ZM9.27563 5.97201C9.27563 7.7967 7.79661 9.27572 5.97192 9.27572C4.14734 9.2756 2.66821 7.79662 2.66821 5.97201C2.66833 4.14749 4.14741 2.66841 5.97192 2.6683C7.79654 2.6683 9.27552 4.14742 9.27563 5.97201ZM17.3313 5.97201C17.3313 7.79669 15.8523 9.27572 14.0276 9.27572C12.203 9.27566 10.7239 7.79666 10.7239 5.97201C10.724 4.14746 12.203 2.66836 14.0276 2.6683C15.8522 2.6683 17.3312 4.14742 17.3313 5.97201Z" />
    </svg>
  );
}

export default function PlusMenu({
  isOpen,
  onClose,
  onFileSelect,
  onOpenFileUpload,
}: PlusMenuProps) {
  const [showAppsSubmenu, setShowAppsSubmenu] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<"right" | "left">(
    "right"
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Detectar si hay espacio suficiente a la derecha
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const submenuWidth = 256; // min-w-64 = 16rem = 256px

      if (rect.right + submenuWidth + 8 > windowWidth) {
        setSubmenuPosition("left");
      } else {
        setSubmenuPosition("right");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Fragment>
      <div
        className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
        ref={menuRef}
      >
        <div className="p-2">
          {/* Opción 1: Subir archivos/imágenes */}
          <button
            onClick={() => {
              onClose(); // Cerrar el menú principal
              onOpenFileUpload?.(); // Abrir el modal
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <UploadIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm whitespace-nowrap">Subir archivos</span>
          </button>

          {/* Opción 2: Añadir desde aplicaciones */}
          <div className="relative">
            <button
              className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
              onMouseEnter={() => setShowAppsSubmenu(true)}
              onMouseLeave={() => setShowAppsSubmenu(false)}
            >
              <AppsIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">
                Añadir desde aplicaciones
              </span>
              <svg
                className="w-4 h-4 ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Submenú de aplicaciones */}
            {showAppsSubmenu && (
              <div
                className={`absolute ${
                  submenuPosition === "right"
                    ? "left-full ml-1"
                    : "right-full mr-1"
                } top-0 min-w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg`}
                onMouseEnter={() => setShowAppsSubmenu(true)}
                onMouseLeave={() => setShowAppsSubmenu(false)}
              >
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors">
                                          <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="text-sm whitespace-nowrap flex-1">
                      Conectar desde Google Drive
                    </span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors">
                                          <div className="w-5 h-5 bg-gray-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    <span className="text-sm whitespace-nowrap flex-1">
                      Conectar desde OneDrive
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de subida de archivos - Ahora se maneja en el componente padre */}
    </Fragment>
  );
}

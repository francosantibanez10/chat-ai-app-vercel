"use client";

import { useState, useRef, useEffect } from "react";
import { Archive, Flag, Trash2 } from "lucide-react";

interface ActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
}

export default function ActionsMenu({
  isOpen,
  onClose,
  onArchive,
  onReport,
  onDelete,
}: ActionsMenuProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
      style={{ backgroundColor: "#111827" }}
      ref={menuRef}
    >
      <div className="p-1">
        {onArchive && (
          <button 
            onClick={() => {
              onArchive();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span className="text-sm">Archivar conversación</span>
          </button>
        )}

        {onReport && (
          <button 
            onClick={() => {
              onReport();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span className="text-sm">Informar problema</span>
          </button>
        )}

        {onDelete && (
          <button 
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-md text-red-400 hover:bg-gray-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Eliminar conversación</span>
          </button>
        )}
      </div>
    </div>
  );
}

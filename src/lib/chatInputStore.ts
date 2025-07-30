import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type InputMode = 'text' | 'image' | 'voice' | 'canvas' | 'file';

export interface ChatInputState {
  // Estado del input
  value: string;
  inputMode: InputMode;
  isTyping: boolean;
  
  // Menús y modales
  showToolsMenu: boolean;
  showImageMenu: boolean;
  showStylesMenu: boolean;
  showFileUpload: boolean;
  showCanvas: boolean;
  
  // Archivos
  selectedFiles: File[];
  isUploading: boolean;
  
  // Estados de carga
  isGeneratingImage: boolean;
  isListening: boolean;
  isLoading: boolean;
  
  // Acciones
  setValue: (value: string) => void;
  setInputMode: (mode: InputMode) => void;
  setIsTyping: (typing: boolean) => void;
  
  // Menús
  toggleToolsMenu: () => void;
  toggleImageMenu: () => void;
  toggleStylesMenu: () => void;
  closeAllMenus: () => void;
  
  // Modales
  setShowFileUpload: (show: boolean) => void;
  setShowCanvas: (show: boolean) => void;
  
  // Archivos
  addFile: (file: File) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  setUploading: (uploading: boolean) => void;
  
  // Estados de carga
  setGeneratingImage: (generating: boolean) => void;
  setListening: (listening: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  value: '',
  inputMode: 'text' as InputMode,
  isTyping: false,
  showToolsMenu: false,
  showImageMenu: false,
  showStylesMenu: false,
  showFileUpload: false,
  showCanvas: false,
  selectedFiles: [],
  isUploading: false,
  isGeneratingImage: false,
  isListening: false,
  isLoading: false,
};

export const useChatInputStore = create<ChatInputState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Acciones del input
      setValue: (value) => set({ value }),
      setInputMode: (mode) => set({ inputMode: mode }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      
      // Gestión de menús
      toggleToolsMenu: () => set((state) => ({ 
        showToolsMenu: !state.showToolsMenu,
        showImageMenu: false,
        showStylesMenu: false 
      })),
      toggleImageMenu: () => set((state) => ({ 
        showImageMenu: !state.showImageMenu,
        showToolsMenu: false,
        showStylesMenu: false 
      })),
      toggleStylesMenu: () => set((state) => ({ 
        showStylesMenu: !state.showStylesMenu,
        showToolsMenu: false,
        showImageMenu: false 
      })),
      closeAllMenus: () => set({ 
        showToolsMenu: false, 
        showImageMenu: false, 
        showStylesMenu: false 
      }),
      
      // Gestión de modales
      setShowFileUpload: (show) => set({ showFileUpload: show }),
      setShowCanvas: (show) => set({ showCanvas: show }),
      
      // Gestión de archivos
      addFile: (file) => set((state) => ({ 
        selectedFiles: [...state.selectedFiles, file] 
      })),
      removeFile: (index) => set((state) => ({ 
        selectedFiles: state.selectedFiles.filter((_, i) => i !== index) 
      })),
      clearFiles: () => set({ selectedFiles: [] }),
      setUploading: (uploading) => set({ isUploading: uploading }),
      
      // Estados de carga
      setGeneratingImage: (generating) => set({ isGeneratingImage: generating }),
      setListening: (listening) => set({ isListening: listening }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Reset completo
      reset: () => set(initialState),
    }),
    {
      name: 'chat-input-store',
    }
  )
); 
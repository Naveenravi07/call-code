import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface IDEState {
  files: FileNode[];
  openFiles: string[];
  activeFile: string | null;
  fileContents: Record<string, string>;
  loading: boolean;
  
  setFiles: (files: FileNode[]) => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string) => void;
  setFileContent: (filePath: string, content: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useIDEStore = create<IDEState>((set, get) => ({
  files: [],
  openFiles: [],
  activeFile: null,
  fileContents: {},
  loading: false,

  setFiles: (files) => set({ files }),
  
  openFile: (filePath) => {
    const { openFiles } = get();
    if (!openFiles.includes(filePath)) {
      set({ 
        openFiles: [...openFiles, filePath],
        activeFile: filePath
      });
    } else {
      set({ activeFile: filePath });
    }
  },
  
  closeFile: (filePath) => {
    const { openFiles, activeFile } = get();
    const newOpenFiles = openFiles.filter(f => f !== filePath);
    const newActiveFile = filePath === activeFile 
      ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
      : activeFile;
    
    set({ 
      openFiles: newOpenFiles,
      activeFile: newActiveFile
    });
  },
  
  setActiveFile: (filePath) => set({ activeFile: filePath }),
  
  setFileContent: (filePath, content) => {
    const { fileContents } = get();
    set({ 
      fileContents: { ...fileContents, [filePath]: content }
    });
  },
  
  setLoading: (loading) => set({ loading }),
}));
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
  connurl: string | null;
  isTerminalOpen: boolean;
  terminalHeight: number;

  setConnUrl: (connUrl: string) => void;
  setFiles: (files: FileNode[]) => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string) => void;
  setFileContent: (filePath: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  
}

export const useIDEStore = create<IDEState>((set, get) => ({
  files: [],
  openFiles: [],
  activeFile: null,
  fileContents: {},
  loading: false,
  connurl: null,
  isTerminalOpen: false,
  terminalHeight: 200,


  setFiles: files => set({ files }),
  setConnUrl: connUrl => set({ connurl: connUrl }),
  
  openFile: filePath => {
    const { openFiles, connurl } = get();
    if (!connurl) throw new Error('Invalid conn url');
    if (!openFiles.includes(filePath)) {
      set({
        openFiles: [...openFiles, filePath],
        activeFile: filePath,
      });
    } else {
      set({ activeFile: filePath });
    }
  },

  closeFile: filePath => {
    const { openFiles, activeFile } = get();
    const newOpenFiles = openFiles.filter(f => f !== filePath);
    const newActiveFile =
      filePath === activeFile
        ? newOpenFiles.length > 0
          ? newOpenFiles[newOpenFiles.length - 1]
          : null
        : activeFile;

    set({
      openFiles: newOpenFiles,
      activeFile: newActiveFile,
    });
  },

  setActiveFile: filePath => set({ activeFile: filePath }),

  setFileContent: (filePath, content) => {
    const { fileContents } = get();
    set({
      fileContents: { ...fileContents, [filePath]: content },
    });
  },

  setLoading: loading => set({ loading }),
  toggleTerminal: () => {
    const { isTerminalOpen } = get();
    set({ isTerminalOpen: !isTerminalOpen });
  },
  
  setTerminalHeight: (height) => set({ terminalHeight: height }),
}));

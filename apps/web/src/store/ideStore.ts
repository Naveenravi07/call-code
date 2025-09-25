import { toast } from '@/components/ui/use-toast';
import { fetchFileStructure } from '@/services/ide-api';
import axios from 'axios';
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
  clipboard: { node: FileNode; operation: 'copy' | 'cut' } | null;

  setConnUrl: (connUrl: string) => void;
  setFiles: (files: FileNode[]) => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string) => void;
  setFileContent: (filePath: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  createFile: (parentPath: string, name: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  renameNode: (oldPath: string, newName: string) => Promise<void>;
  deleteNode: (path: string) => Promise<void>;
  moveNode: (sourcePath: string, targetPath: string) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useIDEStore = create<IDEState>((set, get) => ({
  files: [],
  openFiles: [],
  activeFile: null,
  fileContents: {},
  loading: false,
  connurl: null,
  isTerminalOpen: false,
  terminalHeight: 200,
  clipboard: null,

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

  setTerminalHeight: height => set({ terminalHeight: height }),

  createFile: async (parentPath: string, name: string): Promise<void> => {
    const { connurl } = get();
    if (!connurl) throw new Error('Failed to get the connection url');

    const newFile: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      path: parentPath ? `${parentPath}/${name}` : name,
    };
    console.log('Create new file data ', newFile);
    try {
      const data = await axios.post(`${connurl}/files/create`, newFile);
      if (data.status == 201) {
        const updatedFiles = await fetchFileStructure(connurl);
        set({ files: updatedFiles });
      }
    } catch (err) {
      toast({
        title: 'Operation Failed',
        description: (err as any).message || 'Could not create file', //eslint-disable-line
      });
    }
  },

  createFolder: async (parentPath: string, name: string): Promise<void> => {
    const { connurl } = get();
    if (!connurl) throw new Error('Failed to get the connection url');

    const newFolder: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      path: parentPath ? `${parentPath}/${name}` : name,
      children: [],
    };

    console.log('Create new folder data', newFolder);
    try {
      const data = await axios.post(`${connurl}/folder/create`, newFolder);
      if (data.status == 201) {
        const updatedFiles = await fetchFileStructure(connurl);
        set({ files: updatedFiles });
      }
    } catch (er) {
      toast({
        title: 'Operation Failed',
        description: (er as any).message || 'Could not create folder', //eslint-disable-line
      });
    }
  },

  renameNode: async (oldPath: string, newName: string): Promise<void> => {
    const { openFiles, activeFile, connurl } = get();
    if (!connurl) throw new Error('Failed to get the connection url');

    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    console.log('newPath = ', newPath);
    console.log('oldPath = ', oldPath);

    try {
      const data = await axios.post(`${connurl}/node/rename`, {
        oldPath,
        newPath,
      });
      if (data.status == 200) {
        const updatedFiles = await fetchFileStructure(connurl);
        const updatedOpenFiles = openFiles.map(path => (path === oldPath ? newPath : path));
        const updatedActiveFile = activeFile === oldPath ? newPath : activeFile;
        set({ files: updatedFiles, activeFile: updatedActiveFile, openFiles: updatedOpenFiles });
      }
    } catch (er) {
      toast({
        title: 'Operation Failed',
        description: (er as any).message || 'Could not rename node', //eslint-disable-line
      });
    }
  },

  deleteNode: async (path: string) => {
    const { connurl } = get();
    if (!connurl) throw new Error('Failed to get the connection url');
    console.log('Delete node data ', path);
    try {
      const data = await axios.delete(`${connurl}/node?path=${encodeURIComponent(path)}`);
      if (data.status == 200) {
        const updatedFiles = await fetchFileStructure(connurl);
        set({ files: updatedFiles });
      }
    } catch (er) {
      toast({
        title: 'Operation Failed',
        description: (er as any).message || 'Could not delete node', //eslint-disable-line
      });
    }
  },

  moveNode: async (sourcePath: string, targetPath: string) => {
    const { connurl } = get();
    if (!connurl) throw new Error('Failed to get the connection url');

    console.log('sourcepath = ', sourcePath, '  targetPath= ', targetPath);

    try {
      const data = await axios.post(`${connurl}/node/move`, {
        sourcePath: sourcePath,
        targetPath,
      });
      if (data.status == 200) {
        const updatedFiles = await fetchFileStructure(connurl);
        set({ files: updatedFiles });
      }
    } catch (er) {
      toast({
        title: 'Operation Failed',
        description: (er as any).message || 'Could not move node', //eslint-disable-line
      });
    }
  },
}));

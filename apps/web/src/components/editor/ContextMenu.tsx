'use client';

import type React from 'react';
import type { FileNode } from '@/store/ideStore';
import { File, Folder, Edit, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  node: FileNode | null;
  onClose: () => void;
  onCreateFile: (parentPath: string) => void;
  onCreateFolder: (parentPath: string) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}) => {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const isFolder = node?.type === 'folder';
  const targetPath = isFolder ? node.path : node?.path.split('/').slice(0, -1).join('/') || '';

  return (
    <div
      className="fixed z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
      onContextMenu={e => e.preventDefault()}
    >
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        onClick={() => handleAction(() => onCreateFile(targetPath))}
      >
        <File className="w-4 h-4" />
        New File
      </button>

      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        onClick={() => handleAction(() => onCreateFolder(targetPath))}
      >
        <Folder className="w-4 h-4" />
        New Folder
      </button>

      {node && (
        <>
          <div className="border-t border-border my-1" />

          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            onClick={() => handleAction(() => onRename(node))}
          >
            <Edit className="w-4 h-4" />
            Rename
          </button>

          {/* <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            onClick={() => handleAction(() => onCopy(node))}
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>

          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            onClick={() => handleAction(() => onCut(node))}
          >
            <Scissors className="w-4 h-4" />
            Cut
          </button> */}

          <div className="border-t border-border my-1" />

          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
            onClick={() => handleAction(() => onDelete(node))}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;

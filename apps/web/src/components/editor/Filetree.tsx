import React, { useState, useEffect } from 'react';
import { FileNode, useIDEStore } from '@/store/ideStore';
import { fetchFileStructure, fetchFileContent } from '@/services/ide-api';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode,
  FileType,
  Loader2
} from 'lucide-react';

const getFileIcon = (fileName: string, language?: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <FileType className="w-4 h-4 text-pink-400" />;
    case 'html':
      return <FileType className="w-4 h-4 text-orange-400" />;
    case 'json':
      return <FileType className="w-4 h-4 text-yellow-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-gray-300" />;
    default:
      return <FileText className="w-4 h-4 text-file-tree-file" />;
  }
};

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const { activeFile, openFile, setFileContent, setLoading } = useIDEStore();
  const isSelected = activeFile === node.path;

  const handleClick = async () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      // Only set the active file here, content will be fetched by Editor component
      openFile(node.path);
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center px-2 py-1 cursor-pointer select-none transition-fast
          hover:bg-ide-sidebar-hover
          ${isSelected ? 'bg-file-tree-selected/20 border-l-2 border-file-tree-selected' : ''}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 text-file-tree-folder" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 text-file-tree-folder" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 mr-2 text-file-tree-folder" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-file-tree-folder" />
            )}
          </>
        ) : (
          <>
            <div className="w-4 mr-1" /> {/* Spacer for alignment */}
            {getFileIcon(node.name, node.language)}
            <span className="ml-2" />
          </>
        )}
        <span className={`text-sm ${node.type === 'folder' ? 'text-file-tree-folder' : 'text-file-tree-file'}`}>
          {node.name}
        </span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC = () => {
  const { files, setFiles, loading } = useIDEStore();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileStructure = await fetchFileStructure();
        setFiles(fileStructure);
      } catch (error) {
        console.error('Error fetching file structure:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadFiles();
  }, [setFiles]);

  if (initialLoading) {
    return (
      <div className="w-64 h-full bg-ide-sidebar border-r border-ide-sidebar-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-64 h-full overflow-y-auto bg-ide-sidebar border-r border-ide-sidebar-border">
      <div className="p-3 border-b border-ide-sidebar-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Explorer
        </h2>
      </div>
      <div className="py-2">
        {files.map((node) => (
          <FileTreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
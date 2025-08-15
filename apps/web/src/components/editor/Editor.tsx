import React, { useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { useIDEStore } from '@/store/ideStore';
import { saveFileContent, fetchFileContent } from '@/services/ide-api';
import { X, Loader2 } from 'lucide-react';

const getLanguageExtension = (filePath: string) => {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return [javascript({ jsx: true, typescript: ext.includes('ts') })];
    case 'html':
      return [html()];
    case 'css':
    case 'scss':
    case 'sass':
      return [css()];
    case 'json':
      return [json()];
    default:
      return [];
  }
};

const getFileName = (path: string) => {
  return path.split('/').pop() || path;
};

const EditorTabs: React.FC = () => {
  const { openFiles, activeFile, setActiveFile, closeFile } = useIDEStore();

  return (
    <div className="flex border-b border-ide-tab-border bg-ide-tab">
      {openFiles.map(filePath => (
        <div
          key={filePath}
          className={`
            flex items-center px-3 py-2 text-sm cursor-pointer border-r border-ide-tab-border
            transition-colors duration-200
            ${
              activeFile === filePath
                ? 'bg-ide-tab-active text-foreground'
                : 'bg-ide-tab text-muted-foreground hover:text-foreground hover:bg-ide-sidebar-hover'
            }
          `}
          onClick={() => setActiveFile(filePath)}
        >
          <span className="mr-2">{getFileName(filePath)}</span>
          <button
            className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
            onClick={e => {
              e.stopPropagation();
              closeFile(filePath);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

const Editor: React.FC = () => {
  const { activeFile, fileContents, setFileContent, loading, setLoading,connurl } = useIDEStore();

  useEffect(() => {
    if(!connurl ) return
    const loadFileContent = async () => {
      if (activeFile && !fileContents[activeFile]) {
        setLoading(true);
        try {
          const content = await fetchFileContent(connurl,activeFile);
          setFileContent(activeFile, content);
        } catch (error) {
          console.error('Error fetching file content:', error);
          setFileContent(activeFile, `// Error loading file: ${activeFile}\n// ${error as string}`);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFileContent(); // eslint-disable-line
  }, [activeFile, fileContents, setFileContent, setLoading,connurl]);

  const handleChange = useCallback(
    async (value: string) => {
      if (!connurl) return;
      if (activeFile) {
        setFileContent(activeFile, value);

        try {
          await saveFileContent(connurl,activeFile, value);
        } catch (error) {
          console.error('Error saving file:', error);
        }
      }
    },
    [connurl, activeFile, setFileContent],
  );


  if (!activeFile) {
    return (
      <div className="flex-1 bg-ide-editor flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">Select a file to start editing</p>
            <p className="text-sm mt-2">Choose a file from the explorer to begin coding</p>
          </div>
        </div>
      </div>
    );
  }

  const content = fileContents[activeFile] || '';
  const extensions = getLanguageExtension(activeFile);

  return (
    <div className="flex-1 bg-ide-editor flex flex-col min-h-screen">
      <EditorTabs />

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          onChange={handleChange} // eslint-disable-line
          className="text-sm h-full"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
          }}
        />
      </div>
    </div>
  );
};

export default Editor;

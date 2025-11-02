import React, { useCallback, useEffect, useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { useIDEStore } from '@/store/ideStore';
import { saveFileContent, fetchFileContent } from '@/services/ide-api';
import { X, Loader2 } from 'lucide-react';
import { aura, auraInit } from '@uiw/codemirror-theme-aura';
import { tags as t } from '@lezer/highlight';

const getLanguageExtension = (filePath: string) => {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    // JavaScript variants
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return [javascript({ jsx: true })];

    // TypeScript variants
    case 'ts':
    case 'tsx':
    case 'mts':
    case 'cts':
      return [javascript({ jsx: true, typescript: true })];

    // HTML and templates
    case 'html':
    case 'htm':
    case 'svelte':
    case 'vue':
      return [html()];

    // CSS variants
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return [css()];

    // JSON variants
    case 'json':
    case 'jsonc':
    case 'json5':
      return [json()];

    // Markdown
    case 'md':
    case 'markdown':
    case 'mdx':
      return [html({ matchClosingTags: true })];

    // Config files (treat as JSON)
    case 'babelrc':
    case 'eslintrc':
    case 'prettierrc':
      return [json()];

    default: {
      // Check for dotfiles or config files
      const fileName = filePath.split('/').pop() || '';
      if (
        fileName.startsWith('.') &&
        (fileName.includes('rc') ||
          fileName.includes('config') ||
          fileName === '.env' ||
          fileName === '.gitignore')
      ) {
        return []; // Plain text for config files
      }
      return [];
    }
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
  const {
    activeFile,
    fileContents,
    setFileContent,
    loading,
    setLoading,
    connurl,
    fileScrollPositions,
    setFileScrollPosition,
  } = useIDEStore();
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connurl) return;
    const loadFileContent = async () => {
      if (activeFile && fileContents[activeFile] === undefined) {
        setLoading(true);
        try {
          const content = await fetchFileContent(connurl, activeFile);
          console.log('Fetched content for ', activeFile, ' : ', content);
          setFileContent(activeFile, content);
        } catch (error) {
          console.error('Error fetching file content:', error);
          setFileContent(activeFile, `// Error loading file: ${activeFile}\n// ${String(error)}`);
        } finally {
          setLoading(false);
        }
      }
    };

    void loadFileContent();
  }, [activeFile, fileContents, setFileContent, setLoading, connurl]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeFile && containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        setFileScrollPosition(activeFile, scrollTop);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeFile, setFileScrollPosition]);

  useEffect(() => {
    if (activeFile && containerRef.current) {
      const savedPosition = fileScrollPositions[activeFile] || 0;
      containerRef.current.scrollTop = savedPosition;
      console.log(`Restored scroll position for ${activeFile}: ${savedPosition}`);
    }
  }, [activeFile, fileScrollPositions]);

  const handleChange = useCallback(
    (value: string) => {
      if (!connurl) return;
      if (activeFile) {
        setFileContent(activeFile, value);

        void saveFileContent(connurl, activeFile, value).catch(error => {
          console.error('Error saving file:', error);
        });
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
  const extensions = [aura, ...getLanguageExtension(activeFile)];

  return (
    <div ref={containerRef} className="flex-1 bg-ide-editor flex flex-col h-full overflow-auto">
      <div className="sticky top-0 z-10 bg-ide-editor">
        <EditorTabs />
      </div>

      <div className="flex-1 relative min-h-full">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <CodeMirror
          ref={editorRef}
          value={content}
          height="100%"
          theme={auraInit({
            settings: {
              caret: '#c6c6c6',
              fontFamily: 'monospace',
            },
            styles: [{ tag: t.comment, color: '#6272a4' }],
          })}
          extensions={extensions}
          onChange={handleChange}
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

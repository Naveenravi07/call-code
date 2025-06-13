import { useState, useRef, useEffect } from 'react';
import FileTree from '@/components/ide/FileTree';
import Terminal from '@/components/ide/Terminal';
import BottomControlBar from '@/components/ide/BottomControlBar';
import Preview from '@/components/ide/Preview';
import '@codingame/monaco-vscode-python-default-extension';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import '@/components/ide/user-worker';

export default function Playground() {
  const [showFileTree, setShowFileTree] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showTextEditor, setShowTextEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const [_editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!monacoEl.current) return;

    const createdEditor = monaco.editor.create(monacoEl.current, {
      value: "console.log('Hello world!');",
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
    });

    setEditor(createdEditor);

    return () => {
      createdEditor.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e]">
      <div className="flex-1 flex overflow-hidden">
        {showFileTree && (
          <div className="w-64 border-r border-[#333333] flex flex-col">
            <div className="p-2 text-sm text-gray-400 font-medium border-b border-[#333333]">
              EXPLORER
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree />
            </div>
          </div>
        )}
        <div className="flex-1 flex">
          {showTextEditor && (
            <div className="flex-1 border-r border-[#333333] mt-3">
              <div className="w-full h-full" ref={monacoEl}></div>
            </div>
          )}
          {showPreview && (
            <div className="w-1/2 border-l border-[#333333]">
              <Preview />
            </div>
          )}
        </div>
      </div>
      {showTerminal && (
        <div className="h-80 border-t border-[#333333]">
          <div className="bg-[#252526] text-sm px-4 py-1 text-gray-400 border-b border-[#333333]">
            TERMINAL
          </div>
          <Terminal />
        </div>
      )}
      <BottomControlBar
        showFileTree={showFileTree}
        showTerminal={showTerminal}
        showTextEditor={showTextEditor}
        showPreview={showPreview}
        setShowFileTree={setShowFileTree}
        setShowTerminal={setShowTerminal}
        setShowTextEditor={setShowTextEditor}
        setShowPreview={setShowPreview}
      />
    </div>
  );
}

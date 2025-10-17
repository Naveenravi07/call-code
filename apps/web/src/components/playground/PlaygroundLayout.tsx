import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIDEStore } from '@/store/ideStore';
import Editor from '@/components/editor/Editor';
import FileTree from '@/components/editor/Filetree';
import Terminal from '@/components/editor/Terminal';
import BrowserPreview from '@/components/editor/BrowserPreview';

const PlaygroundLayout: React.FC = () => {
  const { isTerminalOpen } = useIDEStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={80} minSize={30}>
          <div className="flex h-full">
            <div className="w-[250px] min-w-[200px] max-w-[300px] h-full overflow-y-auto">
              <FileTree />
            </div>
            <div className="flex-1 h-full overflow-y-auto">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={isTerminalOpen ? 70 : 100}>
                  <Editor />
                </ResizablePanel>
                {isTerminalOpen && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={15}>
                      <div className="h-full overflow-auto">
                        <Terminal />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="h-full overflow-y-auto">
            <BrowserPreview />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PlaygroundLayout;

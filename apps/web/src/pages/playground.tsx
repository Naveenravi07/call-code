import Editor from '@/components/editor/Editor';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { playGroundStatusSchema, type PlayGroundStatus } from '@repo/shared';
import PlaygroundLoader from '@/components/playgroundLoader';
import FileTree from '@/components/editor/Filetree';
import { TerminalIcon } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIDEStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import BrowserPreview from '@/components/editor/BrowserPreview';
import Terminal from '@/components/editor/Terminal';

export default function Playground() {
  const { session_name } = useSearch({
    from: '/playground',
  });
  const { setConnUrl } = useIDEStore();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [plStatus, setPlStatus] = useState<PlayGroundStatus | undefined>(undefined);
  const { isTerminalOpen, toggleTerminal } = useIDEStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handlePlaygroundStatusMsgs = (eventSrc: EventSource) => {
    eventSrc.onmessage = e => {
      console.log('New Message received');
      try {
        const body = JSON.parse(e.data) as unknown;
        const pl_status = playGroundStatusSchema.parse(body);

        console.log(pl_status);
        setPlStatus(pl_status);

        if (pl_status.ready === true) {
          setConnUrl(`http://ws.${session_name}.call-code.local/api`);
          setIsReady(true);
          return;
        }
      } catch (err) {
        console.error(`Error while parsing message ${String(err)}`);
        setIsReady(false);
      }
    };
    eventSrc.onerror = (error: Event) => {
      eventSrc.close();
      if (eventSrc.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed normally after ready=true');
      } else {
        console.error('SSE Error:', error);
      }
    };
  };

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    if (!session_name) return;

    const eventSrc = new EventSource(
      `http://localhost:8000/playgrounds/status?sessionId=${session_name}`,
    );
    handlePlaygroundStatusMsgs(eventSrc);

    return () => {
      eventSrc.close();
    };
  }, [session_name]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {session_name && isReady ? (
        <>
          <div className="h-screen flex flex-col">
            {/* Header/Toolbar */}
            <div className="h-10 bg-ide-tab border-b border-ide-tab-border flex items-center px-4">
              <div className="flex items-center gap-2"></div>
              <div className="flex-1 text-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Call-code Playground
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTerminal}
                  className="flex items-center gap-2"
                >
                  <TerminalIcon className="w-4 h-4" />
                  Terminal
                </Button>
              </div>
            </div>

            {/* Main IDE Layout */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={isTerminalOpen ? 70 : 100}>
                  <div className="h-full flex">
                    <ResizablePanelGroup direction="horizontal">
                      <ResizablePanel defaultSize={80} minSize={30}>
                        <div className="flex h-full">
                          <div className="w-[250px] min-w-[200px] max-w-[300px] h-full overflow-y-auto">
                            <FileTree />
                          </div>

                          <div className="flex-1 h-full overflow-y-auto">
                            <div className="min-h-full">
                              <Editor />
                            </div>
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
                </ResizablePanel>

                {isTerminalOpen && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={15}>
                      <div className="h-full overflow-y-auto">
                        <Terminal />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </div>
        </>
      ) : (
        <PlaygroundLoader status={plStatus} />
      )}
    </div>
  );
}

import Editor from '@/components/editor/Editor';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { playGroundStatusSchema, type PlayGroundStatus } from '@repo/shared';
import PlaygroundLoader from '@/components/playgroundLoader';
import FileTree from '@/components/editor/Filetree';
import CodePlayground from '@/components/editor/Playground';
import { Moon, Sun } from 'lucide-react';
import { useIDEStore } from '@/store/ideStore';

export default function Playground() {
  const { session_name } = useSearch({
    from: '/playground',
  });
  const { setConnUrl } = useIDEStore();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [plStatus, setPlStatus] = useState<PlayGroundStatus | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden bg-background">
            <FileTree />
            <Editor />
            <CodePlayground />
          </div>
        </>
      ) : (
        <PlaygroundLoader status={plStatus} />
      )}
    </div>
  );
}

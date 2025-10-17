import { useSearch } from '@tanstack/react-router';
import PlaygroundLoader from '@/components/playgroundLoader';
import PlaygroundHeader from '@/components/playground/PlaygroundHeader';
import PlaygroundLayout from '@/components/playground/PlaygroundLayout';
import { usePlaygroundSetup } from '@/hooks/usePlaygroundSetup';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function Playground() {
  const { session_name } = useSearch({ from: '/playground' });
  const { isReady, plStatus } = usePlaygroundSetup(session_name);
  const isDarkMode = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {session_name && isReady ? (
        <div className="h-screen flex flex-col">
          <PlaygroundHeader />
          <PlaygroundLayout />
        </div>
      ) : (
        <PlaygroundLoader status={plStatus} />
      )}
    </div>
  );
}

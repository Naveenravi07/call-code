import React from 'react';
import { TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIDEStore } from '@/store/ideStore';

const PlaygroundHeader: React.FC = () => {
  const { isTerminalOpen, toggleTerminal, addTerminal, isBrowserPreviewReady } = useIDEStore();

  return (
    <div className="h-10 bg-ide-tab border-b border-ide-tab-border flex items-center px-4">
      <div className="flex items-center gap-2"></div>
      <div className="flex-1 text-center">
        <span className="text-sm text-muted-foreground font-medium">Call-code Playground</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={isTerminalOpen ? addTerminal : toggleTerminal}
          disabled={isTerminalOpen && !isBrowserPreviewReady}
          className="flex items-center gap-2"
          title={
            isTerminalOpen && !isBrowserPreviewReady
              ? 'Waiting for browser preview to be ready...'
              : ''
          }
        >
          <TerminalIcon className="w-4 h-4" />
          {isTerminalOpen ? 'New Terminal' : 'Terminal'}
        </Button>
      </div>
    </div>
  );
};

export default PlaygroundHeader;

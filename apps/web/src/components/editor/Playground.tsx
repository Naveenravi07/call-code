import React, { useState } from 'react';
import { useIDEStore } from '@/store/ideStore';
import { Play, Square, RotateCcw, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Playground: React.FC = () => {
  const { activeFile, fileContents } = useIDEStore();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runCode = async () => {
    if (!activeFile || !fileContents[activeFile]) {
      setError('No file selected or file is empty');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOutput = [
        `> Running ${activeFile.split('/').pop()}`,
        '> Compiling...',
        '> Build successful!',
        '',
        'Hello, World!',
        'React component rendered successfully',
        'No errors found',
        '',
        '> Execution completed in 1.2s',
      ];

      setOutput(mockOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput(prev => [...prev, '', '> Execution stopped by user']);
  };

  const clearOutput = () => {
    setOutput([]);
    setError(null);
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Playground
          </h2>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => void runCode()}
            disabled={isRunning || !activeFile}
            className="flex-1"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </Button>

          <Button variant="outline" size="sm" onClick={stopExecution} disabled={!isRunning}>
            <Square className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={clearOutput}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 bg-muted border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Output
          </span>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {!activeFile ? (
            <div className="text-center text-muted-foreground">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm">Select a file to run code</p>
            </div>
          ) : (
            <div className="font-mono text-xs">
              {error && (
                <div className="text-destructive mb-2 p-2 bg-destructive/10 rounded">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {output.length === 0 && !error && !isRunning && (
                <div className="text-muted-foreground text-center py-4">
                  Click "Run" to execute your code
                </div>
              )}

              {output.map((line, index) => (
                <div key={index} className="py-0.5">
                  {line.startsWith('>') ? (
                    <span className="text-primary">{line}</span>
                  ) : line === '' ? (
                    <br />
                  ) : (
                    <span className="text-foreground">{line}</span>
                  )}
                </div>
              ))}

              {isRunning && (
                <div className="flex items-center text-primary">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  <span>Executing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-border bg-muted">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{activeFile ? `Ready: ${activeFile.split('/').pop()}` : 'No file selected'}</span>
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1" />
                Running
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;

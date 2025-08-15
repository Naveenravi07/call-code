import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '@/store/ideStore';
import { X, Terminal as TerminalIcon, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Terminal: React.FC = () => {
  const { isTerminalOpen, toggleTerminal } = useIDEStore();
  const [output, setOutput] = useState<string[]>([
    'Welcome to CodePath Terminal',
    '$ '
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommand = (command: string) => {
    const newOutput = [...output];
    newOutput[newOutput.length - 1] = `$ ${command}`;
    
    switch (command.toLowerCase()) {
      case 'clear':
        setOutput(['Welcome to CodePath Terminal', '$ ']);
        setCurrentInput('');
        return;
      case 'ls':
        newOutput.push('src/', 'public/', 'package.json', 'README.md');
        break;
      case 'pwd':
        newOutput.push('/workspace');
        break;
      case 'help':
        newOutput.push('Available commands: ls, pwd, clear, help');
        break;
      default:
        if (command.trim()) {
          newOutput.push(`Command not found: ${command}`);
        }
        break;
    }
    
    newOutput.push('$ ');
    setOutput(newOutput);
    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    }
  };

  if (!isTerminalOpen) return null;

  return (
    <div className="h-48 bg-ide-editor border-t border-ide-sidebar-border flex flex-col">
      <div className="h-8 bg-ide-tab border-b border-ide-tab-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleTerminal}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleTerminal}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div 
        ref={terminalRef}
        className="flex-1 p-3 bg-ide-editor overflow-y-auto font-mono text-sm text-foreground"
      >
        {output.map((line, index) => (
          <div key={index} className="leading-6">
            {index === output.length - 1 && line.startsWith('$ ') ? (
              <div className="flex items-center">
                <span className="text-green-400">$ </span>
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent outline-none text-foreground ml-1"
                  autoFocus
                />
              </div>
            ) : line.startsWith('$ ') ? (
              <span className="text-green-400">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
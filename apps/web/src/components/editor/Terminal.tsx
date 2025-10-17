import React, { useEffect, useRef } from 'react';
import { useIDEStore } from '@/store/ideStore';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalTab: React.FC<{
  id: string;
  name: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}> = ({ name, isActive, onSelect, onClose }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 cursor-pointer border-r border-ide-tab-border ${
        isActive ? 'bg-ide-editor' : 'bg-ide-tab hover:bg-ide-editor/50'
      }`}
      onClick={onSelect}
    >
      <span className="text-xs">{name}</span>
      <button
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        className="hover:bg-ide-sidebar-border rounded p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

const TerminalInstance: React.FC<{
  id: string;
  isActive: boolean;
  pendingCommands?: string[];
}> = ({ id, isActive, pendingCommands }) => {
  const { connurl } = useIDEStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initializedRef = useRef(false);
  const commandQueueRef = useRef<string[]>([]);
  const executingRef = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || !connurl || initializedRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    // Connect to terminal WebSocket
    const wsUrl = connurl.replace(/^http/, 'ws') + '/terminal';
    const ws = new WebSocket(wsUrl);

    const executeNextCommand = () => {
      if (commandQueueRef.current.length === 0 || executingRef.current) {
        return;
      }

      const cmd = commandQueueRef.current.shift();
      if (!cmd) return;

      executingRef.current = true;
      console.log(`Executing command: ${cmd}`);
      xterm.writeln(`\x1b[36m$\x1b[0m ${cmd}`);
      ws.send(cmd + '\n');

      // Wait for command to complete (detect prompt)
      // For now, use a simple timeout approach
      setTimeout(() => {
        executingRef.current = false;
        executeNextCommand();
      }, 2000);
    };

    ws.onopen = () => {
      xterm.writeln('\x1b[32m✓\x1b[0m Connected to server');

      // If there are pending commands, add them to queue
      if (pendingCommands && pendingCommands.length > 0) {
        console.log('Adding pending commands to queue:', pendingCommands);
        commandQueueRef.current = [...pendingCommands];
        // Start executing after a short delay
        setTimeout(() => {
          executeNextCommand();
        }, 500);
      }
    };

    ws.onmessage = event => {
      const data = event.data as string;
      xterm.write(data);

      // Check if we received a prompt (simple heuristic)
      if (typeof data === 'string' && (data.includes('$ ') || data.includes('# '))) {
        if (executingRef.current) {
          executingRef.current = false;
          // Execute next command after a short delay
          setTimeout(executeNextCommand, 100);
        }
      }
    };

    ws.onclose = event => {
      console.log('WebSocket closed:', event.code, event.reason);

      // Only show error if it's an unexpected close
      if (event.code !== 1000) {
        xterm.writeln('\r\n\x1b[33m⚠\x1b[0m Connection closed unexpectedly. Reconnecting...');

        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (!initializedRef.current) return; // Component unmounted

          xterm.writeln('\x1b[36mℹ\x1b[0m Reconnecting...');
          const newWs = new WebSocket(wsUrl);

          newWs.onopen = () => {
            xterm.writeln('\x1b[32m✓\x1b[0m Reconnected to server');
            wsRef.current = newWs;
          };

          newWs.onmessage = ws.onmessage;
          newWs.onclose = ws.onclose;
          newWs.onerror = ws.onerror;

          wsRef.current = newWs;
        }, 2000);
      }
    };

    ws.onerror = err => {
      console.error('WebSocket error:', err);
      xterm.writeln(`\r\n\x1b[31mError:\x1b[0m Connection error`);
    };

    xterm.onData(data => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    wsRef.current = ws;
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;
    initializedRef.current = true;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      xterm.dispose();
    };
  }, [id, connurl, pendingCommands]);

  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 0);
    }
  }, [isActive]);

  return (
    <div
      ref={terminalRef}
      className={`h-full bg-ide-editor font-mono text-sm ${isActive ? 'block' : 'hidden'}`}
    />
  );
};

const Terminal: React.FC = () => {
  const {
    isTerminalOpen,
    terminals,
    activeTerminalId,
    addTerminal,
    closeTerminal,
    setActiveTerminal,
    toggleTerminal,
    isBrowserPreviewReady,
  } = useIDEStore();

  if (!isTerminalOpen) return null;

  return (
    <div className="h-64 bg-ide-editor border-t border-ide-sidebar-border flex flex-col">
      <div className="h-8 bg-ide-tab border-b border-ide-tab-border flex items-center justify-between">
        <div className="flex items-center h-full overflow-x-auto">
          {terminals.map(terminal => (
            <TerminalTab
              key={terminal.id}
              id={terminal.id}
              name={terminal.name}
              isActive={terminal.id === activeTerminalId}
              onSelect={() => setActiveTerminal(terminal.id)}
              onClose={() => closeTerminal(terminal.id)}
            />
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1"
            onClick={addTerminal}
            disabled={!isBrowserPreviewReady}
            title={
              !isBrowserPreviewReady ? 'Waiting for browser preview to be ready...' : 'New Terminal'
            }
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleTerminal}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {terminals.map(terminal => (
          <TerminalInstance
            key={terminal.id}
            id={terminal.id}
            isActive={terminal.id === activeTerminalId}
            pendingCommands={terminal.pendingCommands}
          />
        ))}
      </div>
    </div>
  );
};

export default Terminal;

import React, { useEffect, useRef } from "react";
import { useIDEStore } from "@/store/ideStore";
import { X, Terminal as TerminalIcon, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const Terminal: React.FC = () => {
  const { isTerminalOpen, toggleTerminal, connurl } = useIDEStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm>();
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    if (!isTerminalOpen || !terminalRef.current ) return;
    if(!connurl) return

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    let wsUrl = connurl.replace(/^http/, "ws") + "/terminal";
    const ws = new WebSocket(wsUrl); 

    ws.onopen = () => {
      xterm.writeln("Connected to server ✅");
    };
    ws.onmessage = (event) => {
      xterm.write(event.data);
    };
    ws.onclose = () => {
      xterm.writeln("\r\nConnection closed ❌");
    };
    ws.onerror = (err) => {
      xterm.writeln(`\r\nError: ${JSON.stringify(err)}`);
    };

    xterm.onData((data) => {
      ws.send(data);
    });

    xtermRef.current = xterm;
    wsRef.current = ws;

    return () => {
      ws.close();
      xterm.dispose();
    };

  }, [isTerminalOpen, connurl]);

  if (!isTerminalOpen) return null;

  return (
    <div className="h-64 bg-ide-editor border-t border-ide-sidebar-border flex flex-col">
      {/* Terminal header */}
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

      {/* Actual terminal */}
      <div
        ref={terminalRef}
        className="flex-1 bg-ide-editor font-mono text-sm text-foreground"
      />
    </div>
  );
};

export default Terminal;


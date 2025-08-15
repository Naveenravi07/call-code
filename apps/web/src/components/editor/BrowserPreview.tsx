import React, { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIDEStore } from '@/store/ideStore';

function stripWsSubdomain(url: string): string {
    const parsed = new URL(url);
    let hostname = parsed.hostname;
    if (hostname.startsWith("ws.")) {
      hostname = hostname.slice(3);
    }
    return `${parsed.protocol}//${hostname}`;
  }
  
const BrowserPreview: React.FC = () => {
  const {connurl} = useIDEStore.getState()
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  const handleNavigate = () => {
    setCurrentUrl(url);
  };

  const handleRefresh = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  }
  
  useEffect(() => {;
    if(!connurl) return;
    let previewUrl = stripWsSubdomain(connurl);
    setUrl(previewUrl);
    setCurrentUrl(previewUrl);
  },[connurl])

  return (
    <div className="w-full h-full bg-ide-sidebar border-l border-ide-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-ide-sidebar-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Browser Preview
        </h2>
      </div>

      {/* URL Bar */}
      <div className="p-3 border-b border-ide-sidebar-border">
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
          />
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="px-2"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => window.open(currentUrl, '_blank')}
            variant="outline"
            size="sm"
            className="px-2"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white">
        <iframe
          id="preview-iframe"
          src={currentUrl}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-ide-tab border-t border-ide-tab-border flex items-center px-3">
        <span className="text-xs text-muted-foreground truncate">
          {currentUrl}
        </span>
      </div>
    </div>
  );
};

export default BrowserPreview;
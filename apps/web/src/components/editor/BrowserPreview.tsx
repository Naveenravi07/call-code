import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIDEStore } from '@/store/ideStore';

function stripWsSubdomain(url: string): string {
  const parsed = new URL(url);
  let hostname = parsed.hostname;
  if (hostname.startsWith('ws.')) {
    hostname = hostname.slice(3);
  }
  // Remove /api from the path if present
  return `${parsed.protocol}//${hostname}`;
}

const BrowserPreview: React.FC = () => {
  const { connurl, isBrowserPreviewReady } = useIDEStore();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = () => {
    setCurrentUrl(url);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = currentSrc;
    }
  };

  useEffect(() => {
    if (!connurl) return;
    const previewUrl = stripWsSubdomain(connurl);
    setUrl(previewUrl);
    setCurrentUrl(previewUrl);
  }, [connurl]);

  useEffect(() => {
    if (isBrowserPreviewReady && iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
    }
  }, [isBrowserPreviewReady, currentUrl]);

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
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleNavigate()}
          />
          <Button onClick={handleRefresh} variant="outline" size="sm" className="px-2">
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
      <div className="flex-1 bg-white relative">
        {!isBrowserPreviewReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Waiting for preview server...</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-ide-tab border-t border-ide-tab-border flex items-center px-3">
        <span className="text-xs text-muted-foreground truncate">{currentUrl}</span>
      </div>
    </div>
  );
};

export default BrowserPreview;

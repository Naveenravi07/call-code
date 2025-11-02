import { useEffect, useState } from 'react';
import { playGroundStatusSchema, type PlayGroundStatus } from '@repo/shared';
import { useIDEStore } from '@/store/ideStore';
import axios from 'axios';

interface CdmrcConfig {
  commands: string[];
  tabs?: string[];
  isLongLivedTask?: boolean;
}

export const usePlaygroundSetup = (sessionName: string | undefined) => {
  const { setConnUrl, connurl, setBrowserPreviewReady, addTerminalWithCommands, openFile } =
    useIDEStore();
  const [isReady, setIsReady] = useState(false);
  const [plStatus, setPlStatus] = useState<PlayGroundStatus | undefined>(undefined);

  useEffect(() => {
    if (!sessionName) return;

    const eventSrc = new EventSource(
      `http://localhost:8000/playgrounds/status?sessionId=${sessionName}`,
    );

    eventSrc.onmessage = e => {
      try {
        const body = JSON.parse(e.data as string) as unknown;
        const pl_status = playGroundStatusSchema.parse(body);
        setPlStatus(pl_status);

        if (pl_status.ready === true) {
          setConnUrl(`http://ws.${sessionName}.call-code.local/api`);
          setIsReady(true);
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

    return () => eventSrc.close();
  }, [sessionName, setConnUrl]);

  // Execute .cdmrc when playground is ready
  useEffect(() => {
    if (!connurl || !isReady) return;

    const executeCdmrc = async () => {
      try {
        // Read .cdmrc file
        console.log('Reading .cdmrc');
        const response = await axios.get<string | CdmrcConfig>(
          `${connurl}/files/content?path=/.cdmrc`,
        );
        console.log('.cdmrc response:', response);
        const cdmrcContent: string | CdmrcConfig = response.data;

        // Parse .cdmrc
        let cdmrcConfig: CdmrcConfig;

        // Check if already parsed as object
        if (typeof cdmrcContent === 'object' && cdmrcContent !== null) {
          cdmrcConfig = cdmrcContent;
        } else if (typeof cdmrcContent === 'string') {
          try {
            cdmrcConfig = JSON.parse(cdmrcContent) as CdmrcConfig;
          } catch {
            // Fallback to line-by-line parsing
            const lines = cdmrcContent
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line && !line.startsWith('#'));
            cdmrcConfig = { commands: lines };
          }
        } else {
          throw new Error('Invalid .cdmrc format');
        }

        // Open tabs if specified
        if (cdmrcConfig.tabs && cdmrcConfig.tabs.length > 0) {
          console.log('Opening tabs:', cdmrcConfig.tabs);
          cdmrcConfig.tabs.forEach(filePath => {
            // Ensure path starts with /
            const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
            openFile(normalizedPath);
          });
        }

        if (cdmrcConfig.commands && cdmrcConfig.commands.length > 0) {
          console.log('Executing .cdmrc commands:', cdmrcConfig.commands);
          console.log('isLongLivedTask:', cdmrcConfig.isLongLivedTask);

          // Open terminal with commands to execute
          addTerminalWithCommands(cdmrcConfig.commands);
        }
      } catch (err) {
        console.log('No .cdmrc file found or error reading it:', err);
      }
    };

    void executeCdmrc();
  }, [connurl, isReady, addTerminalWithCommands, openFile]);

  // Check browser preview AFTER .cdmrc execution (dev server needs time to start)
  useEffect(() => {
    if (!connurl) return;

    const checkBrowserPreview = async (): Promise<void> => {
      try {
        // Remove /api from connurl and strip ws. subdomain
        const previewUrl = connurl.replace(/^http:\/\/ws\./, 'http://').replace(/\/api$/, '');

        console.log('Checking browser preview at:', previewUrl);

        // Use no-cors mode to avoid CORS issues during the check
        // We just want to know if the server responds, not read the response
        const response = await fetch(previewUrl, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
        });

        // In no-cors mode, response.type will be 'opaque' if server responded
        // We can't read status, but if we get here without error, server is up
        console.log('Browser preview is ready (response type:', response.type, ')');
        setBrowserPreviewReady(true);
      } catch (error) {
        console.log('Browser preview not ready yet:', error);
        // Keep retrying until dev server is up
        setTimeout(() => {
          void checkBrowserPreview();
        }, 2000);
      }
    };

    // Start checking after a delay (give .cdmrc time to start dev server)
    const timer = setTimeout(() => {
      void checkBrowserPreview();
    }, 5000);
    return () => clearTimeout(timer);
  }, [connurl, setBrowserPreviewReady]);

  return { isReady, plStatus };
};

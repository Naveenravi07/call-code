import Editor from '@/components/editor/Editor';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { playGroundStatusSchema, type PlayGroundStatus } from '@repo/shared';
import PlaygroundLoader from '@/components/playgroundLoader';
import FileTree from '@/components/editor/Filetree';
import CodePlayground from '@/components/editor/Playground';

export default function Playground() {
  const { session_name } = useSearch({
    from: '/playground',
  });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [plStatus, setPlStatus] = useState<PlayGroundStatus | undefined>(undefined);

  const handlePlaygroundStatusMsgs = (eventSrc: EventSource) => {
    eventSrc.onmessage = e => {
      console.log('New Message received');
      try {
        let body = JSON.parse(e.data);
        let pl_status = playGroundStatusSchema.parse(body);

        console.log(pl_status);
        setPlStatus(pl_status);

        if (pl_status.ready === true) {
          setIsReady(true);
          return;
        }
      } catch (err) {
        console.error(`Error while parsing message ${err}`);
        setIsReady(false);
      }
    };
    eventSrc.onerror = error => {
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
    <>
      {session_name && isReady ? (
        <>
          <div className="flex-1 flex overflow-hidden ">
            <FileTree />
            <Editor />
            <CodePlayground />
          </div>
        </>
      ) : (
        <PlaygroundLoader status={plStatus} />
      )}
    </>
  );
}

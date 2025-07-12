import Editor from '@/components/ide/editor';
import { useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { playGroundStatusSchema } from '@repo/shared';

export default function Playground() {
  const { session_name } = useSearch({
    from: '/playground',
  });

  useEffect(() => {
    console.log('Inside use effect', session_name);
    if (!session_name) return;
    console.log('Inside use effect v2', session_name);
    const eventSrc = new EventSource(
      `http://localhost:8000/playgrounds/status?sessionId=${session_name}`,
    );

    eventSrc.onmessage = e => {
      console.log('New Message received');
      console.log(e)
      try {
        let body = JSON.parse(e.data);
        let pl_status = playGroundStatusSchema.parse(body)
        console.log(pl_status)
      } catch (err) {
        console.error(`Error while parsing message ${err}`)
      }
    };
    eventSrc.onerror = error => {
      console.error('SSE Error:', error);
      eventSrc.close();
    };

    return () => {
      eventSrc.close();
    };
  }, [session_name]);

  return <Editor />;
}

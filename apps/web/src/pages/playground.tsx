import Editor from '@/components/ide/editor';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { playGroundStatusSchema, type PlayGroundStatus } from '@repo/shared';
import PlaygroundLoader from '@/components/playgroundLoader';

export default function Playground() {
    const { session_name } = useSearch({
        from: '/playground',
    });
    const [isReady, setIsReady] = useState<boolean>(false)
    const [plStatus, setPlStatus] = useState<PlayGroundStatus | undefined>(undefined)


    const handlePlaygroundStatusMsgs = (eventSrc: EventSource) => {
        eventSrc.onmessage = e => {
            console.log('New Message received');
            try {
                let body = JSON.parse(e.data);
                let pl_status = playGroundStatusSchema.parse(body)
                console.log(pl_status)
                if (pl_status.ready === true) {
                    setPlStatus(pl_status)
                    setIsReady(true)
                    return
                }
                setPlStatus(pl_status)
            } catch (err) {
                console.error(`Error while parsing message ${err}`)
                setIsReady(false)
            }
        };
        eventSrc.onerror = error => {
            console.error('SSE Error:', error);
            eventSrc.close();
        };
    }

    useEffect(() => {
        if (!session_name) return;

        const eventSrc = new EventSource(`http://localhost:8000/playgrounds/status?sessionId=${session_name}`);
        handlePlaygroundStatusMsgs(eventSrc)

        return () => {
        };
    }, [session_name]);

    return(
        <>
            {isReady ? <Editor /> : <PlaygroundLoader status={plStatus} />}
        </>
    )
}

import { createServiceManifest } from "../templates/service-template"

export function getViteServiceManifest(userid: string, sessionid: string) {
    return createServiceManifest({
        userId: userid,
        sessionId: sessionid,
        ports: [
            {
                name: 'http',
                port: 80,
                targetPort: 5173,
                protocol: "TCP"
            },
            {
                name: 'websocket',
                port: 8080,
                targetPort: 8080,
                protocol: "TCP"
            }
        ]
    })
}

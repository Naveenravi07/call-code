import { createVirtualServiceManifest } from "../templates/virtual-service-template"

export function getViteVirtualServiceManifest(sessionid: string) {
    return createVirtualServiceManifest({
        sessionId: sessionid
    })
}

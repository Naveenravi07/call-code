import { createJobManifest } from "../templates/job-template"

export function getViteManifest(userid: string, sessionid: string) {
    return createJobManifest({
        userId,
        sessionId,
        annotations: {
            "sidecar.istio.io/inject": "true"
        },
        backoffLimit: 4,
        volumes: [
            {
                name: 'code-volume',
                emptyDir: {}
            }
        ],
        initContainers: [
            {
                name: 'copy-code',
                image: 'shastri123/callcode-vite',
                command: ["sh", "-c", "cp -r /usr/src/app/* /shared && cp -r /usr/src/app/.[^.]* /shared"]
            }
        ]
    })
}

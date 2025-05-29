import { createJobManifest } from "../templates/job-template"

export function getViteJobManifest(userid: string, sessionid: string) {
    return createJobManifest({
        userId: userid,
        sessionId: sessionid,
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
                command: ["sh", "-c", "cp -r /usr/src/app/* /shared && cp -r /usr/src/app/.[^.]* /shared"],
                volumeMounts: [
                    {
                        name: 'code-volume',
                        mountPath: "/shared"
                    }
                ]
            }
        ],
        containers: [
            {
                name: 'user-service',
                image: "shastri123/callcode-vite",
                ports: [
                    {
                        containerPort: 5173
                    }
                ],
                volumeMounts: [
                    {
                        name: 'code-volume',
                        mountPath: '/usr/src/app'
                    }
                ]
            },
            {
                name: 'websocket',
                image: "shastri123/callcode-ws",
                ports: [
                    {
                        containerPort: 8080
                    }
                ],
                volumeMounts: [
                    {
                        name: 'code-volume',
                        mountPath: '/code'
                    }
                ]
            }
        ]
    })
}

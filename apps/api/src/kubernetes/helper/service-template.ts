import * as k8s from '@kubernetes/client-node';

interface ServicePort {
    name: string;
    port: number;
    targetPort: number;
}

interface ServiceParams {
    sessionId: string;
    userId: string;
    appName?: string;               // default: 'callcode'
    serviceType?: string;           // default: 'NodePort'
    ports: ServicePort[];
}

export function createServiceManifest({
    sessionId,
    userId,
    appName = 'callcode',
    serviceType = 'NodePort',
    ports
}: ServiceParams): k8s.V1Service {
    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: `callcode-session-${sessionId}`,
            labels: {
                app: appName,
                'session-id': sessionId,
            },
        },
        spec: {
            type: serviceType,
            selector: {
                app: appName,
                'session-id': sessionId,
                'user-id': userId,
            },
            ports: ports.map(({ name, port, targetPort }) => ({
                name,
                port,
                targetPort,
            })),
        },
    };
}


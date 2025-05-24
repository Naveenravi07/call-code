import * as k8s from '@kubernetes/client-node';

interface JobContainer {
    name: string;
    image: string;
    ports?: { containerPort: number }[];
    volumeMounts?: { name: string; mountPath: string }[];
    command?: string[];
}

interface JobVolume {
    name: string;
    emptyDir?: {};
    hostPath?: { path: string; type?: string };
    // Add more volume types as needed
}

interface JobParams {
    sessionId: string;
    userId: string;
    jobName?: string; // Optional, defaults to `callcode-session-{sessionId}`
    labels?: Record<string, string>;
    backoffLimit?: number;
    restartPolicy?: 'Never' | 'OnFailure';
    volumes?: JobVolume[];
    initContainers?: JobContainer[];
    containers: JobContainer[]; // At least one container is required
}

export function createJobManifest({
    sessionId,
    userId,
    jobName = `callcode-session-${sessionId}`,
    labels = {},
    backoffLimit = 2,
    restartPolicy = 'Never',
    volumes = [],
    initContainers = [],
    containers,
}: JobParams): k8s.V1Job {

    const baseLabels = { app: 'callcode', 'session-id': sessionId, 'user-id': userId };
    const mergedLabels = { ...baseLabels, ...labels };

    return {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
            name: jobName,
            labels: mergedLabels,
        },
        spec: {
            backoffLimit,
            template: {
                metadata: {
                    labels: mergedLabels,
                },
                spec: {
                    restartPolicy,
                    volumes,
                    initContainers: initContainers.map(container => ({
                        name: container.name,
                        image: container.image,
                        command: container.command,
                        ports: container.ports,
                        volumeMounts: container.volumeMounts,
                    })),
                    containers: containers.map(container => ({
                        name: container.name,
                        image: container.image,
                        command: container.command,
                        ports: container.ports,
                        volumeMounts: container.volumeMounts,
                    })),
                },
            },
        },
    };
}



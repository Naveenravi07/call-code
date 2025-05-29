import { V1Job, V1Service } from '@kubernetes/client-node';
import { getViteJobManifest } from './manifest/job';
import { getViteServiceManifest } from './manifest/service';
import { getViteVirtualServiceManifest } from './manifest/virtual-service';

interface ManifestGenerator {
    jobManifest: (userId: string, sessionId: string) => V1Job;
    serviceManifest: (userId: string, sessionId: string) => V1Service;
    virtualServiceManifest: (sessionId: string) => any;
}

export const manifestRegistry: Record<string, ManifestGenerator> = {
    'vite': {
        jobManifest: getViteJobManifest,
        serviceManifest: getViteServiceManifest,
        virtualServiceManifest: getViteVirtualServiceManifest
    },
}

export function getManifestGenerator(playgroundType: string): ManifestGenerator {
    const generator = manifestRegistry[playgroundType];
    if (!generator) {
        throw new Error(`No manifest generator found for playground type: ${playgroundType}`);
    }
    return generator;
} 
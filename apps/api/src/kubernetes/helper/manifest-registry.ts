import type { V1Job, V1Service } from '@kubernetes/client-node';
import { getNextJobManifest, getViteJobManifest } from './manifest/job';
import {
  getNextServiceManifest,
  getViteServiceManifest,
} from './manifest/service';
import { getViteVirtualServiceManifest } from './manifest/virtual-service';
import type { V1VirtualService } from './templates/virtual-service-template';
import { PlaygroundType } from '@repo/shared/playgrounds/schema';

interface ManifestGenerator {
  jobManifest: (userId: string, sessionId: string) => V1Job;
  serviceManifest: (userId: string, sessionId: string) => V1Service;
  virtualServiceManifest: (sessionId: string) => V1VirtualService;
}

export const manifestRegistry: Record<PlaygroundType, ManifestGenerator> = {
  vite: {
    jobManifest: getViteJobManifest,
    serviceManifest: getViteServiceManifest,
    virtualServiceManifest: getViteVirtualServiceManifest,
  },
  next: {
    jobManifest: getNextJobManifest,
    serviceManifest: getNextServiceManifest,
    virtualServiceManifest: getViteVirtualServiceManifest,
  },
};

export function getManifestGenerator(
  playgroundType: PlaygroundType,
): ManifestGenerator {
  const generator = manifestRegistry[playgroundType];
  if (!generator) {
    throw new Error(
      `No manifest generator found for playground type: ${playgroundType}`,
    );
  }
  return generator;
}

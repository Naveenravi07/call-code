import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import namor from 'namor';
import { manifestRegistry } from '../kubernetes/helper/manifest-registry';
import { RedisService } from '../redis/redis.service';
import {
  PlayGroundStatus,
  playGroundStatusSchema,
  PlaygroundCreationResponse,
} from '@repo/shared/playgrounds/schema';
import { PlaygroundType } from '@repo/shared/playgrounds/schema';
import { PlaygroundStatusService } from './playground.status.service';

@Injectable()
export class PlaygroundsService {
  constructor(
    @Inject(forwardRef(() => KubernetesService))
    private readonly kubernetesService: KubernetesService,
    private readonly statusService: PlaygroundStatusService,
  ) {}

  getHostUrl(session_name: string) {
    return `ws.${session_name}.call-code.local`;
  }

  async createPlayground(
    playground_type: PlaygroundType,
    user_id: string,
  ): Promise<PlaygroundCreationResponse> {
    const session_name = namor.generate({ words: 2, saltLength: 0 });
    const registry = manifestRegistry[playground_type];

    await Promise.all([
      this.kubernetesService.spawnJob(
        this.kubernetesService.namespace,
        registry.jobManifest(user_id, session_name),
      ),
      this.kubernetesService.createService(
        this.kubernetesService.namespace,
        registry.serviceManifest(user_id, session_name),
      ),
      this.kubernetesService.createIstioVirtualService(
        this.kubernetesService.namespace,
        registry.virtualServiceManifest(session_name),
      ),
    ]);

    const status = this.statusService.createInitialStatus(session_name);
    await this.statusService.saveStatus(session_name, status);
    return {
      session_name,
      status,
    };
  }
}

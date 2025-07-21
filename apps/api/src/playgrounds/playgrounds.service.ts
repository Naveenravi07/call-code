import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import namor from 'namor';
import { manifestRegistry } from '../kubernetes/helper/manifest-registry';
import {
  PlayGroundStatus,
  PlaygroundCreationResponse,
} from '@repo/shared/playgrounds/schema';
import { PlaygroundType } from '@repo/shared/playgrounds/schema';
import { PlaygroundStatusService } from './playground.status.service';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class PlaygroundsService {
  private readonly MAX_DELAY = 4000;
  private readonly BASE_DELAY = 1000;

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

  createStatusObserver(sessionId: string): Observable<PlayGroundStatus> {
    return new Observable((observer: Observer<PlayGroundStatus>) => {
      let retryCount = 0;

      const checkStatus = async () => {
        try {
          const status = await this.statusService.getStatus(sessionId);
          if (status?.ready === false) {
            observer.next(status);
            const delay = Math.min(
              this.BASE_DELAY * Math.pow(2, retryCount),
              this.MAX_DELAY,
            );
            retryCount++;
            setTimeout(checkStatus, delay); //eslint-disable-line @typescript-eslint/no-misused-promises
          } else if (status?.ready === true) {
            observer.next(status);
            observer.complete();
          } else {
            console.log('Error: Invalid status response');
            observer.error(new Error('Invalid status response'));
          }
        } catch (error) {
          console.log('Error: Invalid status response v2');
          console.log(error);
          observer.error(error);
        }
      };

      checkStatus(); //eslint-disable-line @typescript-eslint/no-floating-promises

      return () =>
        console.log(`SSE connection closed for session: ${sessionId}`);
    });
  }
}

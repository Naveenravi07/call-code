import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  KubeConfig,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  V1Job,
  V1Service,
  Watch,
} from '@kubernetes/client-node';
import { PlaygroundsService } from 'src/playgrounds/playgrounds.service';
import { V1VirtualService } from './helper/templates/virtual-service-template';

@Injectable()
export class KubernetesService implements OnModuleInit {
  public readonly namespace = 'default';
  private readonly kubernetesClient: KubeConfig;
  private readonly coreV1Api: CoreV1Api;
  private readonly batchV1Api: BatchV1Api;
  private readonly watch: Watch;
  private readonly customObjectsApi: CustomObjectsApi;

  constructor(
    @Inject(forwardRef(() => PlaygroundsService))
    private readonly playgroundsService: PlaygroundsService,
  ) {
    this.kubernetesClient = new KubeConfig();
    this.kubernetesClient.loadFromDefault();
    this.coreV1Api = this.kubernetesClient.makeApiClient(CoreV1Api);
    this.batchV1Api = this.kubernetesClient.makeApiClient(BatchV1Api);
    this.customObjectsApi =
      this.kubernetesClient.makeApiClient(CustomObjectsApi);
    this.watch = new Watch(this.kubernetesClient);
  }
  async onModuleInit() {
    await this.startJobWatcher().catch(console.error);
  }
  async spawnJob(namespace: string, jobSpec: V1Job) {
    try {
      const response = await this.batchV1Api.createNamespacedJob({
        namespace,
        body: jobSpec,
      });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      throw new Error(`Failed to create job ${msg}`);
    }
  }

  async createService(namespace: string, serviceSpec: V1Service) {
    try {
      const response = await this.coreV1Api.createNamespacedService({
        namespace,
        body: serviceSpec,
      });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      throw new Error(`Failed to create service: ${msg}`);
    }
  }

  async createIstioVirtualService(
    namespace: string,
    virtualServiceSpec: V1VirtualService,
    group = 'networking.istio.io',
    version = 'v1beta1',
    plural = 'virtualservices',
  ): Promise<unknown> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.customObjectsApi.createNamespacedCustomObject(
        {
          version,
          group,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body: virtualServiceSpec,
          plural,
          namespace,
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return response as unknown;
    } catch (error) {
      console.log(error);
      const msg = error instanceof Error ? error.message : '';
      throw new Error(`Failed to create virtual service: ${msg}`);
    }
  }

  async startJobWatcher() {
    try {
      await this.watch.watch(
        `/apis/batch/v1/namespaces/${this.namespace}/jobs`,
        {},
        (phase, job: V1Job) => {
          void (async () => {
            const jobName = job.metadata?.name;
            if (!jobName) return;

            console.log(`[Watcher] Job ${jobName} added to ${phase}`);
            if (!jobName.includes('callcode-session-')) return;

            await this.playgroundsService.updatePlaygroundStatus(
              jobName,
              phase,
              job.status,
            );
          })();
        },
        (err) => {
          if (err) {
            console.error('Job watcher error:', err);
            setTimeout(() => {
              void this.startJobWatcher();
            }, 5000);
          } else {
            console.log('Job watcher ended gracefully');
          }
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to start job watcher:', msg);
    }
  }
}

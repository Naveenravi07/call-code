import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { 
    KubeConfig, 
    BatchV1Api, 
    CoreV1Api, 
    CustomObjectsApi,
    V1Job,
    V1Service,
    Watch
} from '@kubernetes/client-node';
import { PlaygroundsService } from 'src/playgrounds/playgrounds.service';


@Injectable()
export class KubernetesService implements OnModuleInit{
    public readonly namespace = 'default';
    private readonly kubernetesClient: KubeConfig;
    private readonly coreV1Api: CoreV1Api;
    private readonly batchV1Api: BatchV1Api;
    private readonly watch: Watch;
    private readonly customObjectsApi: CustomObjectsApi;

    constructor(
        @Inject(forwardRef(() => PlaygroundsService))
        private readonly playgroundsService: PlaygroundsService
    ) {
        this.kubernetesClient = new KubeConfig();
        this.kubernetesClient.loadFromDefault();
        this.coreV1Api = this.kubernetesClient.makeApiClient(CoreV1Api);
        this.batchV1Api = this.kubernetesClient.makeApiClient(BatchV1Api);
        this.customObjectsApi = this.kubernetesClient.makeApiClient(CustomObjectsApi);
        this.watch = new Watch(this.kubernetesClient);
    }
    onModuleInit() {
        this.startJobWatcher();
    }
    async spawnJob(namespace: string, jobSpec: V1Job) {
        try {
            const response = await this.batchV1Api.createNamespacedJob({
                namespace,
                body: jobSpec
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to create job: ${error.message}`);
        }
    }

    async createService(namespace: string, serviceSpec: V1Service) {
        try {
            const response = await this.coreV1Api.createNamespacedService({
                namespace,
                body: serviceSpec
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to create service: ${error.message}`);
        }
    }

    async createIstioVirtualService(
        namespace: string, 
        virtualServiceSpec: any,
        group = 'networking.istio.io',
        version = 'v1beta1',
        plural = 'virtualservices'
    ) {
        try {
            const response = await this.customObjectsApi.createNamespacedCustomObject(
                {
                    version,
                    group,
                    body: virtualServiceSpec,
                    plural,
                    namespace
                },
            );            return response;
        } catch (error) {
            console.log(error);
            throw new Error(`Failed to create virtual service: ${error.message}`);
        }
    }

    async startJobWatcher() {
        try {
            await this.watch.watch(
                `/apis/batch/v1/namespaces/${this.namespace}/jobs`,{},
                async (phase, job: V1Job) => {

                    const jobName = job.metadata?.name;
                    if (!jobName) return;

                    console.log(`[Watcher] Job ${jobName} added to ${phase}`);
                    if (!jobName.includes('callcode-session-')) return;
                    
                    await this.playgroundsService.updatePlaygroundStatus(jobName,phase,job.status);
                },
                (err) => {
                    if (err) {
                        console.error('Job watcher error:', err);
                        setTimeout(() => this.startJobWatcher(), 5000);
                    } else {
                        console.log('Job watcher ended gracefully');
                    }
                },
            );
        } catch (err) {
            console.error('Failed to start job watcher:', err);
        }
    }

}

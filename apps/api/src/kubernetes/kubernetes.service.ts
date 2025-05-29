import { Injectable } from '@nestjs/common';
import { 
    KubeConfig, 
    BatchV1Api, 
    CoreV1Api, 
    CustomObjectsApi,
    V1Job,
    V1Service
} from '@kubernetes/client-node';


@Injectable()
export class KubernetesService {
    private readonly kubernetesClient: KubeConfig;
    private readonly coreV1Api: CoreV1Api;
    private readonly batchV1Api: BatchV1Api;
    private readonly customObjectsApi: CustomObjectsApi;

    constructor() {
        this.kubernetesClient = new KubeConfig();
        this.kubernetesClient.loadFromDefault();
        this.coreV1Api = this.kubernetesClient.makeApiClient(CoreV1Api);
        this.batchV1Api = this.kubernetesClient.makeApiClient(BatchV1Api);
        this.customObjectsApi = this.kubernetesClient.makeApiClient(CustomObjectsApi);
    }

    async spawnJob(namespace: string, jobSpec: V1Job) {
        try {
            const response = await this.batchV1Api.createNamespacedJob({
                namespace,
                body: jobSpec
            });
            console.log(response);
            return response.status;
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
            console.log(response);
            return response.status;
        } catch (error) {
            throw new Error(`Failed to create service: ${error.message}`);
        }
    }

    async createIstioVirtualService(
        namespace: string, 
        virtualServiceSpec: any,
        group = 'networking.istio.io',
        version = 'v1alpha3',
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
            );
            console.log(response);
            return response;
        } catch (error) {
            throw new Error(`Failed to create virtual service: ${error.message}`);
        }
    }
}

import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import namor from 'namor';
import { manifestRegistry } from 'src/kubernetes/helper/manifest-registry';

@Injectable()
export class PlaygroundsService {
    constructor(private readonly kubernetesService: KubernetesService) {}

    async createPlayground( playground_type: string, user_id: string ) {

        let session_name = namor.generate({ words: 2, saltLength: 0 });
        
        let registry = manifestRegistry[playground_type];
        let [job, service, virtualService] = await Promise.all([
            this.kubernetesService.spawnJob(this.kubernetesService.namespace, registry.jobManifest(user_id, session_name)),
            this.kubernetesService.createService(this.kubernetesService.namespace, registry.serviceManifest(user_id, session_name)),
            this.kubernetesService.createIstioVirtualService(this.kubernetesService.namespace, registry.virtualServiceManifest(session_name)),
        ])
        
        return {
            job,
            service,
            virtualService,
        }
    }
}

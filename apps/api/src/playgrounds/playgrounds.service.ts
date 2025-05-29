import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';

@Injectable()
export class PlaygroundsService {
    constructor(private readonly kubernetesService: KubernetesService) {}

    async createPlayground() {
    }
}

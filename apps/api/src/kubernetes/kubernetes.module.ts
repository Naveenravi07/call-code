import { Module } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';

@Module({
  providers: [KubernetesService]
})
export class KubernetesModule {}

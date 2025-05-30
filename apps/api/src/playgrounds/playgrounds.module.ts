import { Module } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { PlaygroundsController } from './playgrounds.controller';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [KubernetesModule,AuthModule],
    controllers: [PlaygroundsController],
    providers: [PlaygroundsService],
})
export class PlaygroundsModule { }

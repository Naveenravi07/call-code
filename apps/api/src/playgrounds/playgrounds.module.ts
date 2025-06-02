import { forwardRef, Module } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { PlaygroundsController } from './playgrounds.controller';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [
        RedisModule,
        forwardRef(() => KubernetesModule),
        AuthModule,
    ],
    controllers: [PlaygroundsController],
    providers: [PlaygroundsService],
    exports: [PlaygroundsService]
})
export class PlaygroundsModule { }

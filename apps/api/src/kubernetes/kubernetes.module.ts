import { forwardRef, Module } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import { RedisModule } from 'src/redis/redis.module';
import { PlaygroundsModule } from 'src/playgrounds/playgrounds.module';

@Module({
    imports: [
        RedisModule,
        forwardRef(() => PlaygroundsModule),
    ],
    providers: [KubernetesService],
    exports: [KubernetesService]
})
export class KubernetesModule { }

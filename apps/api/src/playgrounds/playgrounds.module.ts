import { forwardRef, Module } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { PlaygroundsController } from './playgrounds.controller';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
import { PlaygroundStatusService } from './playground.status.service';

@Module({
  imports: [RedisModule, forwardRef(() => KubernetesModule), AuthModule],
  controllers: [PlaygroundsController],
  providers: [PlaygroundsService, PlaygroundStatusService],
  exports: [PlaygroundsService, PlaygroundStatusService],
})
export class PlaygroundsModule {}

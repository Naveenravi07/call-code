import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { PlaygroundsModule } from './playgrounds/playgrounds.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    PlaygroundsModule,
    KubernetesModule,
    RedisModule
  ],
})
export class AppModule {}

import { Module, Global } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';
import { RedisService } from './redis.service';
import { ConfigModule } from 'src/config/config.module';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async (configService: ConfigService) => {
                return new Redis(configService.getRedisConfig);
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule { }


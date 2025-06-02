import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';
import { ZodSchema } from 'zod';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) { }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.redisClient.set(key, stringValue, 'EX', ttlSeconds);
        } else {
            await this.redisClient.set(key, stringValue);
        }
    }

    async get<T>(key: string, schema?: ZodSchema<T>): Promise<T | null> {
        const data = await this.redisClient.get(key);
        if (!data) return null;

        try {
            const parsed = JSON.parse(data);
            return schema ? schema.parse(parsed) : parsed;
        } catch {
            return schema ? null : (data as unknown as T);
        }
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return (await this.redisClient.exists(key)) === 1;
    }

    getClient(): Redis {
        return this.redisClient;
    }

    async onModuleDestroy() {
        await this.redisClient.quit();
    }
}
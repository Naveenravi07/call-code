import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly redis: Redis;

    constructor() {
        this.redis = new Redis();
    }

    async setPlaygroundStatus(sessionName: string, status: any) {
        await this.redis.set(
            `playground:${sessionName}`,
            JSON.stringify(status),
            'EX',
            3600 // expire after 1 hour
        );
    }

    async getPlaygroundStatus(sessionName: string) {
        const status = await this.redis.get(`playground:${sessionName}`);
        return status ? JSON.parse(status) : null;
    }

    onModuleDestroy() {
        this.redis.disconnect();
    }
}

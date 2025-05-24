import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: Pool;
  public db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(private readonly configService: ConfigService) {
    this.client = new Pool({
      connectionString: this.configService.databaseUrl,
    });
    this.db = drizzle(this.client, { schema });
  }

  async onModuleInit() {
    await this.client.connect()
  }

  async onModuleDestroy() {
    await this.client.end();
  }
} 
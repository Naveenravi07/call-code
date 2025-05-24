import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq, and } from 'drizzle-orm';
import { User, users, Provider } from '../database/schema/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async findByProviderId(providerId: string, provider: Provider): Promise<User | undefined> {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(and(
        eq(users.providerid, providerId),
        eq(users.provider, provider)
      ));
    return user;
  }

  async createUser(
    name: string,
    provider: Provider,
    providerId: string,
    email?: string | null,
    pfp?: string | null,
  ): Promise<User> {
    const [user] = await this.db.db
      .insert(users)
      .values({
        id: uuidv4(),
        name,
        provider,
        providerid: providerId,
        email: email || null,
        pfp: pfp || null,
      })
      .returning();
    return user;
  }
} 
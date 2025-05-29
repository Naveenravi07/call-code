import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Provider } from '../database/schema/user.schema';
import { DatabaseService } from '../database/database.service';
import { User } from '../database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { users } from '../database/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly db: DatabaseService) {}

  async validateUser(profile: any): Promise<User> {
    const providerId = profile.id;
    const provider = profile.provider as Provider;
    
    let user = await this.usersService.findByProviderId(providerId, provider);
    
    if (!user) {
      user = await this.usersService.createUser(
        profile.displayName || profile.username,
        provider,
        providerId,
        profile.emails?.[0]?.value,
        profile.photos?.[0]?.value,
      );
    }

    return user;
  }

  async findUser(id: string): Promise<User | null> {
    try {
      const [user] = await this.db.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }
} 

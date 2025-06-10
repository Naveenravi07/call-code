import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Provider } from '../database/schema/user.schema';
import { DatabaseService } from '../database/database.service';
import { User } from '../database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { users } from '../database/schema/user.schema';
import { Profile as GithubProfile } from 'passport-github2';
import { Profile as GoogleProfile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly db: DatabaseService,
  ) {}

  async validateUser<T extends GithubProfile | GoogleProfile>(
    profile: T,
  ): Promise<User> {
    const providerId = profile.id;
    const provider = profile.provider as Provider;

    let user = await this.usersService.findByProviderId(providerId, provider);
    if (profile?.emails?.[0]?.value == undefined)
      throw new UnauthorizedException('Failed to read email');

    if (!user) {
      user = await this.usersService.createUser(
        profile.username || profile.displayName,
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

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Env, true>) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get isDevelopment(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  get port(): number {
    return this.configService.get('PORT');
  }

  get clientUrl(): string {
    return this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
  }


  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'your-jwt-secret';
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret';
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL');
  }

  get googleConfig() {
    return {
      clientID: this.configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: this.configService.get('GOOGLE_CALLBACK_URL'),
    };
  }

  get githubConfig() {
    return {
      clientID: this.configService.get('GITHUB_CLIENT_ID'),
      clientSecret: this.configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: this.configService.get('GITHUB_CALLBACK_URL'),
    };
  }
} 
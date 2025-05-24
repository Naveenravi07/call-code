import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { User } from '../database/schema/user.schema';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: this.configService.jwtSecret,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
        },
        {
          secret: this.configService.jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string, isRefresh = false) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: isRefresh
          ? this.configService.jwtRefreshSecret
          : this.configService.jwtSecret,
      });
      return payload;
    } catch {
      return null;
    }
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, true);
    if (!payload) {
      return null;
    }

    const user = { id: payload.sub } as User;
    return this.generateTokens(user);
  }
} 
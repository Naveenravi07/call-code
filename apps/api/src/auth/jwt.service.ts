import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { JwtUser } from './types/jwt-payload.type';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: JwtUser) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          pfp: user.pfp,
        },
        {
          secret: this.configService.jwtSecret,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
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
      const payload = await this.jwtService.verifyAsync<JwtUser>(token, {
        secret: isRefresh
          ? this.configService.jwtRefreshSecret
          : this.configService.jwtSecret
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
    const user = await this.userService.findById(payload.id);
    if(!user) throw new UnauthorizedException("User not authorized")
    return this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      pfp: user.pfp,
    });
  }
} 
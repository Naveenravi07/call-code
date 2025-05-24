import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { ConfigService } from '../../config/config.service';
import { JwtUser } from '../types/jwt-payload.type';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    let accessToken = request.cookies['access_token'];
    if (!accessToken) {
      const refreshToken = request.cookies['refresh_token'];
      if (!refreshToken) {
        throw new UnauthorizedException('No tokens found');
      }
      
      const tokens = await this.jwtService.refreshTokens(refreshToken);
      if (!tokens) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        throw new UnauthorizedException('Invalid refresh token');
      }

      response.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: this.configService.isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      response.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: this.configService.isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      accessToken = tokens.accessToken;
    }

    const payload = await this.jwtService.verifyToken(accessToken) as JwtUser;
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }
    request.user = payload;
    
    return true;
  }
} 
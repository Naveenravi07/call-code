import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../jwt.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const token = req.cookies['access_token'];
      
      if (token) {
        const payload = await this.jwtService.verifyToken(token);
        if (payload?.sub) {
          req.userId = payload.sub;
        }
      }
    } catch (error) {
      // If there's any error, we just continue without setting the userId
      // This ensures the request continues even if token verification fails
    }

    next();
  }
} 
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (!request.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only fetch user data when the route is protected with JwtGuard
    const user = await this.authService.findUser(request.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Attach the user object for this request
    request.user = user;
    return true;
  }
} 
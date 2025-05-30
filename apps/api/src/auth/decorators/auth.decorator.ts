import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtUser } from '../types/jwt-payload.type';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtUser => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not found in request');
        }

        return user as JwtUser;    
    },
);

import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { user } from '@repo/shared-config/src/schemas';


export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): user.JwtUser => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not found in request');
        }

        return user as user.JwtUser;    
    },
);

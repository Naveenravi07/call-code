import { JwtUser } from '@repo/shared/user/schema';

declare module 'express' {
    interface Request {
        user?: JwtUser;
    }
}

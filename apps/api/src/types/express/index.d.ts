import { JwtUser } from '@repo/api/user/schema';

declare module 'express' {
    interface Request {
        user?: JwtUser;
    }
}
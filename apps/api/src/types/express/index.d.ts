import { user } from '@repo/shared-config/src/schemas';

declare module 'express' {
    interface Request {
        user?: user.JwtUser;
    }
}
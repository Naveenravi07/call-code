import { JwtUser } from "src/auth/types/jwt-payload.type";

declare module 'express' {
    interface Request {
        user?: JwtUser;
    }
}
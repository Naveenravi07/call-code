import type { User } from "src/database/schema";

declare module 'express' {
    interface Request {
        user?: User;
        userId?: string;
    }
}
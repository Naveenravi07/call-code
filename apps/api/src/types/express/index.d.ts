import type { JwtUser } from '@repo/shared/user/schema';

declare module 'express' {
  interface Request {
    user?: JwtUser;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
    cookies: Record<string, string>;
  }
}

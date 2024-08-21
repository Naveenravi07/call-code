import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/* eslint-disable */
export function zodMiddleWare(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.log('[Error] Zod Error Occured');
  /* eslint-enable */
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: err.flatten(),
    });
  } else if (err instanceof Error) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({
      message: error.message,
    });
  } else {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}

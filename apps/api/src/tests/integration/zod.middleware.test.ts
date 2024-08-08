import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { ZodError } from 'zod';
import { zodMiddleWare } from '../../middlewares/zod.middleware';
import { CustomError } from '../../classes/CustomError.class';

describe('zodMiddleWare', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.get('/test/zoderror', (req: Request, res: Response, next: NextFunction) => {
      next(new ZodError([{ code: 'custom', path: ['field'], message: 'Invalid field' }]));
    });

    app.get('/test/othererror', (req: Request, res: Response, next: NextFunction) => {
      next(new CustomError(400, 'Something wrong'));
    });

    app.get('/test/unknownerror', (req: Request, res: Response, next: NextFunction) => {
      next('unknown error');
    });

    app.use(zodMiddleWare);
  });

  test('should handle ZodError and respond with 400 status', async () => {
    const response = await request(app).get('/test/zoderror');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.formErrors).toEqual([]);
    expect(response.body.error.fieldErrors).toHaveProperty('field');
  });

  test('should handle other Error and respond with its status', async () => {
    const response = await request(app).get('/test/othererror');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Something wrong');
  });

  test('should handle unknown error and respond with 500 status', async () => {
    const response = await request(app).get('/test/unknownerror');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
  });
});

import { createEFSForPlayground } from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
  const efs = await createEFSForPlayground();
  res.send(200);
}

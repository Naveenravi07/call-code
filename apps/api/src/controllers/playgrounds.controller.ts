import { runECSPlaygroundTask } from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
  const taskStat = await runECSPlaygroundTask();
  res.send(200);
}

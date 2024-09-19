import {
  runECSPlaygroundTask,
} from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
  const taskStat = await runECSPlaygroundTask("code-vite3");
  res.send(200);
}

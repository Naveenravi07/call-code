import {
  createTargetGroupForPlayground,
  runECSPlaygroundTask,
} from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
  const taskArn = await runECSPlaygroundTask("code-vite3:10");
  const elb = await createTargetGroupForPlayground()
  res.send(200);
}

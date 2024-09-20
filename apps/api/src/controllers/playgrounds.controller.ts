import {
  createTargetGroupForPlayground,
  runECSPlaygroundTask,
} from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
    const tg_Arn = await createTargetGroupForPlayground()
  const taskArn = await runECSPlaygroundTask("code-vite3:10",tg_Arn);
  res.send(200);
}

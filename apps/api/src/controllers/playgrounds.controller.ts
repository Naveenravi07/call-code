import { createEFSForPlayground,createMountTargetForPlayground } from '$/services/playground.service';
import { Request, Response } from 'express';

export async function createPlaygroundController(req: Request, res: Response) {
  const efs = await createEFSForPlayground();
  if(efs.FileSystemId == undefined) return
  const moountStat = await createMountTargetForPlayground(efs.FileSystemId)
  res.send(200);
}

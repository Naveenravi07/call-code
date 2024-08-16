import { Router } from 'express';
import * as pgController from '../controllers/playgrounds.controller';

const pgRouter = Router();

pgRouter.post('/create', pgController.createPlaygroundController);

export default pgRouter;

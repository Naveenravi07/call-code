import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const authRouter = Router();

authRouter.get('/google/login', authController.googleLoginController);
authRouter.get('/google/cb', authController.googleLoginCBController);

authRouter.get('/github/login', authController.githubLoginController);
authRouter.get('/github/cb', authController.githubLoginCBController);

authRouter.get('/success', authController.authSuccessController);
authRouter.get('/me', authController.getUserDetailsController);

export default authRouter;

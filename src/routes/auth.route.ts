import { Router } from "express";
import * as authController from '../controllers/auth.controller'

let authRouter = Router()

authRouter.get('/google/login', authController.googleLoginController)
authRouter.get('/google/cb',authController.googleLoginCBController)

export default authRouter
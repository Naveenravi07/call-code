import { Router } from "express";
import * as authController from '../controllers/auth.controller'

let authRouter = Router()

authRouter.get('/login', authController.loginController)
authRouter.get('/auth/oauth2/cb',authController.authCallBackController)

export default authRouter

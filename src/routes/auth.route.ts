import { Router } from "express";
import * as authController from '../controllers/auth.controller'

let authRouter = Router()

authRouter.get('/login', authController.loginController)
authRouter.get('/oauth2/cb',authController.authCallBackController)
authRouter.get('/profile',authController.getProfileController)

export default authRouter

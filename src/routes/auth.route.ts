import { Router } from "express";
import * as authController from '../controllers/auth.controller'

let authRouter = Router()

authRouter.post('/signup', authController.signupController)

export default authRouter

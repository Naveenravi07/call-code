import { NextFunction, Request, Response } from "express";
import passport from "passport";

require('dotenv').config()

async function googleLoginController(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
      })(req,res,next)
}

async function googleLoginCBController(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
        failureRedirect: '/auth/google/err',
        successRedirect:"/auth/success",
      })(req,res,next)
}

async function authSuccessController(req:Request,res:Response){
  res.cookie('x-auth-cookie',req.user?.id)
  res.send("Success")
}

export {googleLoginController, googleLoginCBController,authSuccessController }

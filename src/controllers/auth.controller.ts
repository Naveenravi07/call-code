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
        successRedirect:"/",
      })(req,res,next)
}


export {googleLoginController, googleLoginCBController }

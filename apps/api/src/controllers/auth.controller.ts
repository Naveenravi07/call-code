import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

require('dotenv').config();

async function googleLoginController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
}

async function googleLoginCBController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', {
    failureRedirect: '/auth/google/err',
    successRedirect: '/auth/success',
  })(req, res, next);
}

async function githubLoginController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
  })(req, res, next);
}

async function githubLoginCBController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('github', {
    failureRedirect: '/login',
    successRedirect: '/auth/success',
  })(req, res, next);
}

async function authSuccessController(req: Request, res: Response) {
  console.log('Auth Success Printing User Data');
  console.log(req.user);
  res.cookie('x-auth-cookie', req.user?.id);
  res.send('Success');
}

export {
  googleLoginController,
  googleLoginCBController,
  authSuccessController,
  githubLoginController,
  githubLoginCBController,
};

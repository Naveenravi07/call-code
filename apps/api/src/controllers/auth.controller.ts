import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

async function googleLoginController(req: Request, res: Response, next: NextFunction) {
  console.log(req.user);
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
  const clienturl =
    (process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_PROD_URL
      : process.env.CLIENT_DEV_URL) ?? 'http://localhost:';
  console.log('Auth Success Printing User Data', req.user);
  res.cookie('x-auth-cookie', req.user?.id);
  res.redirect(clienturl);
}

export {
  googleLoginController,
  googleLoginCBController,
  authSuccessController,
  githubLoginController,
  githubLoginCBController,
};

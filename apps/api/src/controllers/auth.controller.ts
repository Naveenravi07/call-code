import { CustomError } from '$/classes/CustomError.class';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

const clienturl =
  (process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_PROD_URL
    : process.env.CLIENT_DEV_URL) ?? 'http://localhost:5173';

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
  console.log('Auth Success Printing User Data', req.user);
  res.cookie('x-auth-cookie', req.user?.id);
  res.redirect(clienturl);
}

async function getUserDetailsController(req: Request, res: Response) {
  const { user } = req;
  if (user == undefined) {
    res.clearCookie('x-auth-cookie');
  }
  res.setHeader('Access-Control-Allow-Credential', clienturl);
  res.setHeader('Access-Control-Allow-Origin', clienturl);
  res.json(user ?? undefined).status(user ? 200 : 404);
}

async function logoutUserController(req: Request, res: Response) {
  req.logout(function (err) {
    if (err) {
      throw new CustomError(400, err);
    }
    res.clearCookie('x-auth-cookie');
    res.send('Ok').status(200);
  });
}

export {
  googleLoginController,
  googleLoginCBController,
  authSuccessController,
  githubLoginController,
  githubLoginCBController,
  getUserDetailsController,
  logoutUserController,
};

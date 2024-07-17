import { NextFunction, Request, Response } from "express";
import cookie from "cookie"
import { v4 as uuid } from "uuid"
import passport from "passport";
import { Strategy as OpenIDConnectStrategy, Profile, VerifyCallback } from "passport-openidconnect";
import { getOIDC_Credentials, saveOIDC_Credentials } from "$/services/oidc.service";

require('dotenv').config()

const clientId = process.env['AUTH0_CLIENT_ID'] ?? "";
const clientSecret = process.env['AUTH0_CLIENT_SECRET'] ?? "";
const auth0Domain = process.env['AUTH0_DOMAIN'] ?? "";

if (!clientId || !clientSecret || !auth0Domain) {
    throw new Error("Missing required Auth0 environment variables");
}

passport.use(new OpenIDConnectStrategy(
    {
        issuer: `https://${auth0Domain}/`,
        authorizationURL: `https://${auth0Domain}/authorize`,
        tokenURL: `https://${auth0Domain}/oauth/token`,
        userInfoURL: `https://${auth0Domain}/userinfo`,
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: '/auth/oauth2/cb',
        scope: ['profile'],
    },
    function verify(_issuer: string, profile: Profile, cb: VerifyCallback) {
        return cb(null, profile);
    }
));

async function loginController(req: Request, res: Response, next: NextFunction) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies?.sessionId || uuid()
    const nonce = uuid()

    if (await getOIDC_Credentials(sessionId) == null) {
        await saveOIDC_Credentials(sessionId, nonce)
    }

    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 1000 * 60 * 5, })
    passport.authenticate('openidconnect', { scope: 'openidconnect', state: nonce })(req, res, next);
}

async function authCallBackController(req: Request, res: Response, next: NextFunction) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies?.sessionId
    const OIDC_CREDS = await getOIDC_Credentials(sessionId)

    passport.authenticate('openidconnect', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        scope: 'openidconnect',
        state: OIDC_CREDS?.value
    })(req, res, next)
}


export { loginController, authCallBackController, passport }

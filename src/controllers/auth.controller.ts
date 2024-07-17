import { Request, Response } from "express";
import cookie from "cookie"
import { v4 as uuid } from "uuid"
import passport from "passport";
import { Strategy as OpenIDConnectStrategy, Profile, VerifyCallback } from "passport-openidconnect";
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
        callbackURL: '/oauth2/cb',
        scope: ['profile'],
    },
    function verify(issuer: string, profile: Profile, cb: VerifyCallback) {
        return cb(null, profile);
    }
));

async function loginController(req: Request, res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies?.sessionId || uuid()
    const nonce = uuid()
    const key = `${sessionId}:${nonce}`
    passport.authenticate('openidconnect', { scope: 'openid profile' })(req, res);
}

async function authCallBackController(req: Request, res: Response) {
    passport.authenticate('openidconnect', {
        successRedirect: '/',
        failureRedirect: '/login',
        scope: 'openidconnect'
    })
}


export { loginController, authCallBackController }

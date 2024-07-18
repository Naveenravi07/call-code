import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

const serverUrl =
    process.env.NODE_ENV === "production"
        ? process.env.SERVER_URL_PROD
        : process.env.SERVER_URL_DEV;

const clientId = process.env.GOOGLE_AUTH_CLIENT_ID ?? "";
const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET ?? "";

const googleLogin = new GoogleStrategy(
    {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL : "/auth/google/redirect"
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => { }
);

passport.use(googleLogin);

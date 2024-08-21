import { User } from '$/database/schema/user.schema';
import { createNewUser, getUserById, getUserDetailsFromEmail } from '$/services/user.service';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { v4 as uuidv4 } from 'uuid';

const serverUrl =
  process.env.NODE_ENV === 'production' ? process.env.SERVER_PROD_URL : process.env.SERVER_DEV_URL;

const clientId = process.env.GOOGLE_AUTH_CLIENT_ID ?? '';
const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET ?? '';

passport.serializeUser(function (user: Express.User, cb) {
  process.nextTick(function () {
    return cb(null, user.id);
  });
});

passport.deserializeUser(async function (id: string, cb) {
  process.nextTick(async function () {
    const user = await getUserById(id);
    if (user) {
      return cb(null, user);
    }
    cb(null);
  });
});

const googleLogin = new GoogleStrategy(
  {
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: `${serverUrl}/auth/google/cb`,
  },
  /* eslint-disable */
  async function verify(accessToken: any, refreshToken: any, profile: any, done: any) {
    try {
      const prevUser = await getUserDetailsFromEmail(profile.email);
      if (prevUser) {
        return done(null, prevUser);
      }
      const newUser: User = {
        id: uuidv4(),
        provider: 'google',
        pwd: null,
        name: profile._json.name,
        email: profile._json.email,
        pfp: profile._json.picture,
        providerid: profile._json.sub,
      };
      await createNewUser(newUser);
      return done(null, newUser);
    } catch (err) {
      console.log(err);
    }
  },
  /* eslint-enable */
);
export default passport.use(googleLogin);

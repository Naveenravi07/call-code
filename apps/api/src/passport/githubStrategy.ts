import { User } from "$/database/schema/user.schema";
import {
  createNewUser,
  findUserWithProvider,
  getUserById,
} from "$/services/user.service";
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import { v4 as uuidv4 } from "uuid";

const serverUrl =
  process.env.NODE_ENV === "production"
    ? process.env.SERVER_PROD_URL
    : process.env.SERVER_DEV_URL;

let GH_CLIENTID = process.env.GITHUB_CLIENTID ?? "";
let GH_CLIENTSEC = process.env.GITHUB_CLIENT_SECRET ?? "";

passport.serializeUser(function (user: Express.User, cb) {
  process.nextTick(function () {
    return cb(null, user.id);
  });
});

passport.deserializeUser(async function (id: string, cb) {
  process.nextTick(async function () {
    let user = await getUserById(id);
    if (user) {
      return cb(null, user);
    }
    cb(null);
  });
});

let githubLogin = new GithubStrategy(
  {
    clientID: GH_CLIENTID,
    clientSecret: GH_CLIENTSEC,
    callbackURL: `${serverUrl}auth/github/cb`,
  },
  async function (
    accessToken: any,
    refreshToken: any,
    profile: any,
    done: any,
  ) {
    try {
      console.log(profile);
      let prevuser = await findUserWithProvider(profile._json.id, "github");
      if (prevuser) {
        return done(null, prevuser);
      }
      let newUser: User = {
        id: uuidv4(),
        provider: "github",
        pwd: null,
        providerid: profile._json.id,
        pfp: profile._json.avatar_url,
        email: profile._json.email ?? null,
        name: profile.displayName,
      };
      console.log(newUser);
      await createNewUser(newUser);
      return done(null, profile);
    } catch (err) {
      console.log(err);
    }
  },
);

export default passport.use(githubLogin);

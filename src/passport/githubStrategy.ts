import { User } from "$/database/schema/user.schema";
import { createNewUser, getUserById, getUserDetailsFromEmail } from "$/services/user.service";
import passport from "passport";
import {Strategy as GithubStrategy} from "passport-github2"
import { v4 as uuidv4 } from "uuid";

const serverUrl = process.env.NODE_ENV === 'production' ? process.env.SERVER_PROD_URL : process.env.SERVER_DEV_URL;

let GH_CLIENTID = process.env.GITHUB_CLIENTID ?? ""
let GH_CLIENTSEC = process.env.GITHUB_CLIENT_SECRET ?? ""

let githubLogin = new GithubStrategy({
    clientID: GH_CLIENTID,
    clientSecret: GH_CLIENTSEC,
    callbackURL: `${serverUrl}auth/github/cb`
  },
  function(accessToken, refreshToken, profile, done) {
   
  }
)

export default passport.use(githubLogin)
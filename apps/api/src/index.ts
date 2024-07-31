import express, { Application } from 'express';
import { zodMiddleWare } from './middlewares/zod.middleware';
import { client } from './database/db';
import authRouter from './routes/auth.route';
import session from 'express-session';
import passport from 'passport';
import cookieparser from 'cookie-parser';
import cors from 'cors';

const PORT = 8000;
const app: Application = express();

app.use(cors({ origin: '*' }));

app.use(cookieparser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hello',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  }),
);

//Passport Setup
app.use(passport.initialize());
app.use(passport.session());
import './passport/googleStrategy';
import './passport/githubStrategy';

//Routes
app.get('/', (req, res) => {
  res.send('Pong');
});

app.use('/auth', authRouter);
//Middlewares
app.use(zodMiddleWare);

app.listen(PORT, () => {
  client
    .connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.log('Database connection failed', err));
  console.log('Application Running in port' + PORT);
});

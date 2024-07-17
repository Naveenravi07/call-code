import express, { Application } from "express"
import { zodMiddleWare } from "./middlewares/zod.middleware"
import session from 'express-session'
import { client } from "./database/db"
import authRouter from "./routes/auth.route"
import {passport} from "./controllers/auth.controller"

const PORT = 8000
const app: Application = express()

app.use(session({
    secret: process.env.SESSION_SECRET || "heloo",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user: Express.User, done) => done(null, user));
passport.deserializeUser((user: Express.User, done) => done(null, user));


app.get('/', (req, res) => {
    res.clearCookie("sessionId")
    res.send("Hello ")
})

app.use('/auth', authRouter)


app.use(zodMiddleWare)

app.disable('x-powered-by')
app.listen(PORT, () => {
    client.connect()
        .then(() => console.log("Database connected successfully"))
        .catch((err) => console.log("Database connection failed", err))
    console.log("Application Running in port" + PORT)
})

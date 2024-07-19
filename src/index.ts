import express, { Application } from "express"
import { zodMiddleWare } from "./middlewares/zod.middleware"
import { client } from "./database/db"
import authRouter from "./routes/auth.route"
import session from "express-session"
import passport from "passport"
import cookieparser from "cookie-parser"

const PORT = 8000
const app: Application = express()

app.use(cookieparser())
app.use(session({
    secret: process.env.SESSION_SECRET || "hello",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        secure : false
    }
}));

//Passport Setup
app.use(passport.initialize())
app.use(passport.session())
import "./passport/googleStrategy"

//Routes
app.get('/', (req, res) => {
    console.log(req.user)
    res.send('<a href="/auth/google/login">Authenticate with google</a>') 
})
app.use('/auth', authRouter)

//Middlewares
app.use(zodMiddleWare)


app.listen(PORT, () => {
    client.connect()
        .then(() => console.log("Database connected successfully"))
        .catch((err) => console.log("Database connection failed", err))
    console.log("Application Running in port" + PORT)
})

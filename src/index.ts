import express, { Application } from "express"
import { zodMiddleWare } from "./middlewares/zod.middleware"
import { client } from "./database/db"
import authRouter from "./routes/auth.route"
import passport from "passport"

const PORT = 8000
const app: Application = express()

//Passport Setup
app.use(passport.initialize())
require('./passport/googleStrategy')

//Routes
app.get('/', (req, res) => {
    console.log(req.session)
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

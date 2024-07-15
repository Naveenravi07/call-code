import express, {Application} from "express"
import { zodMiddleWare } from "./middlewares/zod.middleware"
import { client } from "./database/db"
import authRouter from "./routes/auth.route"

const PORT = 8000
const app : Application  = express()

app.use('/auth',authRouter)
app.use(zodMiddleWare)


app.listen(PORT,()=>{
    client.connect()
    .then(()=>console.log("Database connected successfully"))
    .catch((err)=>console.log("Database connection failed",err))

    console.log("Application Running in port"+ PORT)
})

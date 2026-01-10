import express from "express"

import cookieParser from "cookie-parser"
const app = express()

app.use(cors())
app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({}))
app.use('/temp', express.static('temp'))
app.use(cookieParser())


export default app
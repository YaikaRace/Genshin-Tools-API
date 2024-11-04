import express from 'express'
import morgan from 'morgan'
import * as db from './services/db'
import userRouter from './routes/user'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import verifyToken from './middlewares/verifyToken'
import verifyAccess from './middlewares/verifyAccess'

const port = 3000

dotenv.config()

const app = express()

app.use(
  cors({
    origin: ['http://localhost:8080'],
    methods: '*',
    credentials: true
  })
)

void db.connect()

app.use(express.json())
app.use(morgan('common'))
app.use(cookieParser())

app.use(verifyAccess)

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' })
  console.log(_req.headers.origin)
})

app.use('/user/auth', userRouter)

app.use(verifyToken)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "This page doesn't exist"
  })
})

app.listen(port)
console.log(`Listening on port ${port}`)

import express from 'express'
import morgan from 'morgan'
import userRouter from '../src/routes/user'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import verifyAccess from '../src/middlewares/verifyAccess'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: [
      process.env.ORIGIN !== undefined
        ? process.env.ORIGIN
        : 'http://localhost:8080'
    ],
    credentials: true
  })
)

app.use(cookieParser())
app.use(morgan('common'))
app.use(express.json())

app.use(verifyAccess)

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' })
  console.log(_req.headers.origin)
})

app.use('/user', userRouter)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "This page doesn't exist"
  })
})

export = app

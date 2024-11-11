import path from 'path'
import express from 'express'
import morgan from 'morgan'
import userRouter from '../src/routes/user'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import verifyAccess from '../src/middlewares/verifyAccess'

const PORT = 3000

dotenv.config({
  path: path.join(__dirname, '..', '.env.local')
})

const app = express()

app.use(
  cors({
    origin:
      process.env.ORIGIN !== undefined
        ? process.env.ORIGIN
        : 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200
  })
)

app.use(cookieParser())
app.use(morgan('common'))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    message:
      'Genshin Tools API HomePage to start using the API login at /login route to get your token'
  })
})

app.use(verifyAccess)

app.use('/user', userRouter)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "This page doesn't exist"
  })
})

const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

server.once('error', (err) => {
  if (err.message.includes('EADDRINUSE')) {
    console.log(`Error listening port ${PORT}`)
  }
})

export = app

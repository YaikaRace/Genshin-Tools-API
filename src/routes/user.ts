import { Router } from 'express'
import * as db from '../services/db'
import isStatusMessage from '../utils/isStatusMessage'

const router = Router()

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  const result = await db.registerUser({
    username,
    email,
    password
  })
  if (isStatusMessage(result)) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

router.post('/login', async (req, res) => {
  const data = await db.loginUser(req.body)
  if (isStatusMessage(data)) {
    res.status(400).json(data)
    return
  }
  res
    .cookie('access_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none'
    })
    .json(data)
})

router.get('/logout', async (_req, res) => {
  res.clearCookie('access_token')
  res.json({
    success: true,
    message: 'Logout Successfuly'
  })
})

router.get('/me', async (req, res) => {
  const token = req.cookies.access_token
  const result = await db.me(token)
  if (isStatusMessage(result)) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

export default router

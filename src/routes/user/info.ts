import { Router } from 'express'
import * as db from '../../services/db'
import isStatusMessage from '../../utils/isStatusMessage'
import verifyToken from '../../middlewares/verifyToken'

const router = Router()

router.get('/me', verifyToken, async (req, res) => {
  if (req.session?.user?._id === undefined) return
  const result = await db.me(req.session?.user?._id)
  if (isStatusMessage(result)) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.patch('/me', verifyToken, async (req, res) => {
  if (req.session?.user?._id === undefined) return
  const { username, email, password } = req.body
  const result = await db.updateUser(req.session?.user?._id, {
    username,
    email,
    password
  })
  if (isStatusMessage(result)) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

export default router

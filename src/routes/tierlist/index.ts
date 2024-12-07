import { Router } from 'express'
import * as db from '../../services/db'
import isStatusMessage from '../../utils/isStatusMessage'
import verifyToken from '../../middlewares/verifyToken'
import { CustomRequest } from '../../types'

const router = Router()

router.post('/', verifyToken, async (req: CustomRequest, res) => {
  if (req.session === undefined) return
  const result = await db.saveTierlist(req.body, req.session.user._id as string)
  if (isStatusMessage(result)) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.get('/', verifyToken, async (req: CustomRequest, res) => {
  if (req.session === undefined) return
  const result = await db.getUserTierlists(req.session.user._id as string)
  res.json(result)
})

router.get('/:id', verifyToken, async (req: CustomRequest, res) => {
  const result = await db.getTierlistById(req.params.id)
  if (isStatusMessage(result)) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

export default router

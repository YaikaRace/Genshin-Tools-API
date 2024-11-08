import { Router } from 'express'
import authRouter from './auth'
import infoRouter from './info'

const router = Router()

router.use('/auth', authRouter)

router.use('/info', infoRouter)

export default router

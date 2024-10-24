import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export default (req: Request, res: Response, next: NextFunction): void => {
  const secret = process.env.JWT_SECRET as string
  const token = req.cookies.access_token
  let data = null
  try {
    data = jwt.verify(token, secret)
    ;(req as { [key: string]: any }).session = data
    next()
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'You have to login before doing that'
    })
  }
}

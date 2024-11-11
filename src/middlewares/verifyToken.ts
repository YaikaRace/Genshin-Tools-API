import { NextFunction, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { CustomRequest } from '../types'

export default (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const secret = process.env.JWT_SECRET as string
  const token = req.cookies.access_token
  let data = null
  try {
    data = jwt.verify(token, secret)
    const { _id, username } = data as JwtPayload
    const user = {
      _id,
      username
    }
    req.session = {
      user
    }
    next()
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'You have to login before doing that'
    })
  }
}

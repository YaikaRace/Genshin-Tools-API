import { NextFunction, Request, Response } from 'express'

export default (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-access-key']
  if (key !== process.env.ACCESS_KEY) {
    res.status(403).json({
      success: false,
      message: 'API access denied'
    })
    return
  }
  next()
}

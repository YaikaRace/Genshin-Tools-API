import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    session?: {
      user: Partial<UserSession>
    }
  }
}

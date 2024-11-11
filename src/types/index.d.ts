import { Request } from 'express'

export type CustomReq = Request & {
  session?: {
    user: Partial<UserSession>
  }
}

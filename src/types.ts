import { Request } from 'express'
import { z } from 'zod'

export const userInfoSchema = z.object({
  _id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(50, { message: 'Password must not contain more than 50 characters' }),
  role: z.string().optional()
})

export const userInfoNoSensitiveSchema = userInfoSchema.omit({ password: true })
export const newUserSchema = userInfoSchema.omit({ _id: true, role: true })
export const loginUserSchema = userInfoSchema.pick({
  username: true,
  password: true
})
export const updateUserSchema = newUserSchema.partial()

export interface UserInfo extends z.infer<typeof userInfoSchema> {}

export type UserInfoNoSensitive = z.infer<typeof userInfoNoSensitiveSchema>
export type NewUser = z.infer<typeof newUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export interface StatusMessage {
  success: boolean
  message: string
}

export interface UserSession extends Pick<UserInfo, '_id' | 'username'> {
  token: string
}

export type CustomRequest = Request & {
  session?: {
    user: Partial<UserSession>
  }
}

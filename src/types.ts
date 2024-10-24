import { z } from 'zod'

export const userInfoSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional()
})

export const userInfoNoSensitiveSchema = userInfoSchema.omit({ password: true })
export const newUserSchema = userInfoSchema.omit({ _id: true, role: true })
export const loginUserSchema = userInfoSchema.pick({
  username: true,
  password: true
})

export interface UserInfo extends z.infer<typeof userInfoSchema> {}

export type UserInfoNoSensitive = z.infer<typeof userInfoNoSensitiveSchema>
export type NewUser = z.infer<typeof newUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>

export interface StatusMessage {
  success: boolean
  message: string
}

export interface UserSession extends Pick<UserInfo, '_id' | 'username'> {
  token: string
}

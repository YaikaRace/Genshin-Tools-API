import { model, Schema } from 'mongoose'
import { UserInfo } from '../types'

const userSchema: Schema<UserInfo> = new Schema<UserInfo>({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  }
})

export default model<UserInfo>('user', userSchema)

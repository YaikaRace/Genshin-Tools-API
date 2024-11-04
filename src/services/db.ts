import mongoose from 'mongoose'
import {
  LoginUser,
  loginUserSchema,
  NewUser,
  newUserSchema,
  StatusMessage,
  UserInfo,
  UserInfoNoSensitive,
  userInfoNoSensitiveSchema,
  UserSession
} from '../types'
import User from '../models/User'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import isStatusMessage from '../utils/isStatusMessage'

export const connect = async (): Promise<void> => {
  try {
    const uri =
      process.env.MONGODB_URI !== undefined ? process.env.MONGODB_URI : ''
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'tests'
    })
    console.log('Connected to DB')
  } catch (e) {
    console.log('Error connecting to DB')
  }
}

export const loginUser = async (
  user: LoginUser
): Promise<UserSession | StatusMessage> => {
  try {
    const validatedUser = loginUserSchema.safeParse(user).data
    const userSession = await createSession(validatedUser as LoginUser)
    return userSession
  } catch (error) {
    return {
      success: false,
      message: 'The user is invalid'
    }
  }
}

export const registerUser = async (
  user: NewUser
): Promise<UserInfoNoSensitive | StatusMessage> => {
  try {
    const rounds =
      process.env.SALT_ROUNDS !== undefined ? process.env.SALT_ROUNDS : 10
    const salt = await bcrypt.genSalt(+rounds)
    user.password = await bcrypt.hash(user.password, salt)
    const validatedUser = newUserSchema.safeParse(user)
    if (!validatedUser.success) {
      return {
        success: false,
        message: validatedUser.error as any
      }
    }
    const newUser = new User(validatedUser.data)
    const userInfo = await newUser.save()
    const { password, ...newUserInfo } = userInfo.toObject()
    return { ...newUserInfo }
  } catch (error) {
    return {
      success: false,
      message:
        'Registration error, make sure to include the following fields: username, email, password'
    }
  }
}

export const findUser = async (
  user: LoginUser
): Promise<UserInfo | StatusMessage> => {
  const validatedUser = loginUserSchema.safeParse(user).data
  const { username } = validatedUser as LoginUser
  const foundUser = await User.findOne({ username })
  if (foundUser === null) {
    return {
      success: false,
      message: 'Este usuario no existe'
    }
  }
  return foundUser.toObject()
}

export const me = async (
  token: string
): Promise<UserInfoNoSensitive | StatusMessage> => {
  const secret = process.env.JWT_SECRET ?? ''
  let data
  try {
    data = jwt.verify(token, secret) as JwtPayload
  } catch {
    return {
      success: false,
      message: 'Session has expired'
    }
  }
  const { _id } = data
  const user = await findByID(_id)
  return user
}

export const findByID = async (
  id: string
): Promise<UserInfoNoSensitive | StatusMessage> => {
  const found = await User.findById(id)
  if (found === undefined || found === null) {
    return {
      success: false,
      message: 'User not found'
    }
  }
  const obj = found.toJSON()
  obj._id = obj._id.toString()
  const userInfo = userInfoNoSensitiveSchema.safeParse(obj)
  if (userInfo.data === undefined) {
    return {
      success: false,
      message: 'User not found'
    }
  }
  return userInfo.data
}

const createSession = async (
  user: LoginUser
): Promise<UserSession | StatusMessage> => {
  const secret = process.env.JWT_SECRET
  const foundUser = await findUser(user)
  if (isStatusMessage(foundUser)) {
    return foundUser
  }
  const { _id, username } = foundUser
  const token = jwt.sign({ _id, username }, secret as string, {
    expiresIn: '1h'
  })
  const userSession: UserSession = { _id, username, token }
  return userSession
}

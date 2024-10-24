import mongoose from 'mongoose'
import {
  LoginUser,
  loginUserSchema,
  NewUser,
  newUserSchema,
  StatusMessage,
  UserInfo,
  UserInfoNoSensitive,
  UserSession
} from '../types'
import User from '../models/User'
import jwt from 'jsonwebtoken'
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
    return { ...userInfo.toObject() }
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
    expiresIn: '30s'
  })
  const userSession: UserSession = { _id, username, token }
  return userSession
}

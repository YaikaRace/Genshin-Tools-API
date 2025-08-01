import mongoose from 'mongoose'
import {
  LoginUser,
  loginUserSchema,
  NewUser,
  newUserSchema,
  SavedTierlist,
  StatusMessage,
  Tierlist,
  tierlistSchema,
  UpdateUser,
  UserInfo,
  UserInfoNoSensitive,
  userInfoNoSensitiveSchema,
  userInfoSchema,
  UserSession
} from '../types'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import isStatusMessage from '../utils/isStatusMessage'
import TierlistModel from '../models/TierlistModel'

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

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
}

export const loginUser = async (
  user: LoginUser
): Promise<UserSession | StatusMessage> => {
  try {
    const validatedUser = loginUserSchema.safeParse(user).data
    if (validatedUser === undefined) {
      return {
        success: false,
        message: 'Username or Password is invalid'
      }
    }
    const userSession = await createSession(validatedUser)
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
    const found = await findUser(user)
    if (!isStatusMessage(found)) {
      return {
        success: false,
        message: 'The Username is already taken'
      }
    }
    const validatedUser = newUserSchema.safeParse(user)
    if (!validatedUser.success) {
      return {
        success: false,
        message: validatedUser.error.issues[0].message
      }
    }
    const userData = validatedUser.data
    userData.password = await hashPassword(userData.password)
    // TODO: Send Mail
    await connect()
    const newUser = new User(userData)
    const userInfo = await newUser.save()
    await disconnect()
    const { password, ...newUserInfo } = userInfo.toObject()
    return { ...newUserInfo }
  } catch (error) {
    return {
      success: false,
      message: 'Registration error, some fields are invalid'
    }
  }
}

export const findUser = async (
  user: LoginUser
): Promise<UserInfo | StatusMessage> => {
  const validatedUser = loginUserSchema.safeParse(user).data
  if (validatedUser === undefined) {
    return {
      success: false,
      message: "This user does't exist"
    }
  }
  const { username } = validatedUser
  await connect()
  const foundUser = await User.findOne({ username })
  await disconnect()
  if (foundUser === null) {
    return {
      success: false,
      message: "This user does't exist"
    }
  }
  return foundUser.toObject()
}

export const updateUser = async (
  id: string,
  payload: UpdateUser
): Promise<UserInfoNoSensitive | StatusMessage> => {
  const parsed = userInfoSchema
    .omit({ _id: true, role: true })
    .partial()
    .safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message
    }
  }
  if (parsed.data.password !== undefined) {
    parsed.data.password = await hashPassword(parsed.data.password)
  }
  await connect()
  const found = await User.findByIdAndUpdate(id, parsed.data, { new: true })
  if (found === null) {
    return {
      success: false,
      message: 'User not found'
    }
  }
  const updated = (await found.save()).toObject()
  updated._id = updated._id.toString()
  await disconnect()
  return userInfoNoSensitiveSchema.parse(updated)
}

export const me = async (
  id: string
): Promise<UserInfoNoSensitive | StatusMessage> => {
  const user = await findByID(id)
  return user
}

export const findByID = async (
  id: string
): Promise<UserInfoNoSensitive | StatusMessage> => {
  await connect()
  const found = await User.findById(id)
  await disconnect()
  if (found === undefined || found === null) {
    return {
      success: false,
      message: 'User not found'
    }
  }
  const obj = found.toJSON()
  obj._id = obj._id.toString()
  const userInfo = userInfoNoSensitiveSchema.safeParse(obj)
  if (!userInfo.success) {
    return {
      success: false,
      message: userInfo.error.issues[0].message
    }
  }
  return userInfo.data
}

const hashPassword = async (password: string): Promise<string> => {
  const rounds =
    process.env.SALT_ROUNDS !== undefined ? process.env.SALT_ROUNDS : 10
  const salt = await bcrypt.genSalt(+rounds)
  return await bcrypt.hash(password, salt)
}

const createSession = async (
  user: LoginUser
): Promise<UserSession | StatusMessage> => {
  const secret = process.env.JWT_SECRET
  const foundUser = await findUser(user)
  if (isStatusMessage(foundUser)) {
    return foundUser
  }
  const { password } = foundUser
  const result = await bcrypt.compare(user.password, password)
  if (!result) {
    return {
      success: false,
      message: 'Password is invalid'
    }
  }
  foundUser._id = foundUser._id?.toString() ?? foundUser._id
  const { _id, username } = foundUser
  const token = jwt.sign({ _id, username }, secret as string, {
    expiresIn: '30d'
  })
  const userSession: UserSession = { _id, username, token }
  return userSession
}

export const saveTierlist = async (
  tierlist: Tierlist,
  userId: string
): Promise<StatusMessage | SavedTierlist> => {
  const parsed = tierlistSchema.safeParse(tierlist)
  if (!parsed.success) {
    return {
      success: false,
      message: 'Tierlist is invalid'
    }
  }
  await connect()
  const result = new TierlistModel({ ...parsed.data, userId })
  const saved = await result.save()
  await disconnect()
  const obj = saved.toObject()
  const _id = obj._id.toString()
  return { ...obj, _id }
}

export const getUserTierlists = async (userId: string): Promise<Tierlist[]> => {
  await connect()
  const result = await TierlistModel.find({ userId })
  await disconnect()
  return result
}

export const getTierlistById = async (
  id: string
): Promise<StatusMessage | Tierlist> => {
  await connect()
  const result = await TierlistModel.findById(id)
  await disconnect()
  if (result === null) {
    return {
      success: false,
      message: "Tierlist doesn't exist"
    }
  }
  return result.toObject()
}

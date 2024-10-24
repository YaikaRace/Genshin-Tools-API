import { NewUser, UserInfo, UserInfoNoPassword } from '../types'

let users: UserInfo[] = [
  {
    id: 1,
    name: 'YaikaRace',
    description: 'The best streamer',
    password: 'yaikarace'
  },
  {
    id: 2,
    name: 'YahirKurosaki',
    description: 'A normal person',
    password: 'yahirkurosaki'
  }
]

export const getUsers = (): UserInfo[] => {
  return users
}

export const getUsersNoPassword = (): UserInfoNoPassword[] => {
  return users.map(({ id, name, description }) => {
    return { id, name, description }
  })
}

export const searchUserByIdNoPassword = (
  id: number
): UserInfoNoPassword | undefined => {
  return getUsersNoPassword().find((user) => user.id === id)
}

export const searchUserById = (id: number): UserInfoNoPassword | undefined => {
  return users.find((user) => user.id === id)
}

export const addUser = (newUser: NewUser): NewUser => {
  const { name, description, password } = newUser
  const newUserObj = { id: users.length + 1, name, description, password }
  users.push(newUserObj)
  return newUserObj
}

export const updateUser = (
  id: number,
  newData: Partial<NewUser>
): Partial<UserInfo> | undefined => {
  const updatedUser = { ...searchUserById(id), ...newData }
  const foundUser = users.find((user) => user.id === id)
  if (foundUser === undefined) {
    return undefined
  }
  users = users.map((user) =>
    user.id === updatedUser.id ? { ...user, ...updatedUser } : user
  )
  return updatedUser
}

export const deleteUser = (id: number): UserInfo[] | undefined => {
  const foundUser = users.find((user) => user.id === id)
  if (foundUser === undefined) {
    return undefined
  }
  return users.splice(
    users.findIndex((user) => user.id === id),
    1
  )
}

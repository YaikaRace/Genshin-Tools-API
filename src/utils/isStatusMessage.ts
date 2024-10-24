import { StatusMessage } from '../types'

export default (arg: any): arg is StatusMessage => {
  try {
    return (arg as StatusMessage).success !== undefined
  } catch {
    return false
  }
}

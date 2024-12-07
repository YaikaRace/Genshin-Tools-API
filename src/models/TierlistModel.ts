import { model, Schema } from 'mongoose'
import { Tier, Tierlist } from '../types'

const tierlistSchema = new Schema<Tierlist & { userId: string }>({
  tiers: {
    type: [] as Tier[],
    required: true
  },
  userId: {
    type: String,
    required: true
  }
})

export default model('tierlist', tierlistSchema)

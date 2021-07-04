import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  from: {
    // username
    type: String,
    required: true,
  },
  to: {
    // groupname
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Message', MessageSchema)
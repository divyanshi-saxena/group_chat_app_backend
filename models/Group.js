import mongoose from 'mongoose'

const GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true,
    unique: true
  },
  groupdesc: {
    type: String,
    required: true
  }
}, {
    timestamps: true
})

export default mongoose.model('Group', GroupSchema)

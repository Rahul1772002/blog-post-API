import mongoose from 'mongoose';
import User from './userModel.js'

const postsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required...'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required...'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Posts', postsSchema);

export default Post

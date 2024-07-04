import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uploaded_tress: {
      type:Number,
      default:0,
    },
    verified:{
      type:Boolean,
      default: false,
    },
    Phone_number:{
      type:Number,
      required:false
    },
    Verified_trees:{
      type:Number,
      default:0
    },
    username: {
      type: String,
      default:"Not assigned"
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

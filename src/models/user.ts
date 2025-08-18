//node modules
import mongoose, { Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    x?: string;
    youtube?: string;
  };
}

// user schema definition
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: [true, 'Username must be unique'],
      maxLength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email cannot exceed 50 characters'],
      unique: [true, 'Email must be unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // do not return password in queries
      minLength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },
    firstName: {
      type: String,
      maxLength: [30, 'First name cannot exceed 30 characters'],
    },
    lastName: {
      type: String,
      maxLength: [30, 'Last name cannot exceed 30 characters'],
    },
    socialLinks: {
      website: String,
      facebook: String,
      instagram: String,
      github: String,
      linkedin: String,
      x: String,
      youtube: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default (mongoose.models.User as Model<IUser>) ||
  model<IUser>('User', userSchema);

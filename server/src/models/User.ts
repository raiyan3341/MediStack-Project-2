import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'organization' | 'admin' | 'owner';
export type AccountStatus = 'active' | 'suspended';

export interface IUser extends Document {
  firebaseUid?: string;
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  organizationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, default: '', index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'organization', 'admin', 'owner'],
      default: 'user',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);


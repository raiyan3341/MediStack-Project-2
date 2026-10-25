import mongoose, { Document, Schema } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface IDonorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  contactNumber: string;
  contactEmail?: string;
  contactPreference: 'call' | 'whatsapp' | 'email';
  lastDonationDate?: Date;
  isAvailable: boolean;
  consentGiven: boolean;
  totalDonationsCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      index: true,
    },
    city: { type: String, required: true, trim: true, index: true },
    area: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    contactEmail: { type: String, default: '' },
    contactPreference: {
      type: String,
      enum: ['call', 'whatsapp', 'email'],
      default: 'call',
    },
    lastDonationDate: { type: Date, default: null },
    isAvailable: { type: Boolean, default: true, index: true },
    consentGiven: { type: Boolean, default: true },
    totalDonationsCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const DonorProfile = mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);


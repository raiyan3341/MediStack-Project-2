import mongoose, { Document, Schema } from 'mongoose';
import { BloodGroup } from './DonorProfile.js';

export type RequestUrgency = 'normal' | 'urgent' | 'critical';
export type BloodRequestStatus = 'open' | 'fulfilled' | 'cancelled';

export interface IBloodDonorResponse {
  donorUserId: mongoose.Types.ObjectId;
  donorName: string;
  donorPhone: string;
  message?: string;
  status: 'offered' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface IBloodRequest extends Document {
  requesterUserId: mongoose.Types.ObjectId;
  requesterName: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  city: string;
  area: string;
  contactNumber: string;
  requiredDate: Date;
  urgency: RequestUrgency;
  reasonNotes?: string;
  status: BloodRequestStatus;
  responses: IBloodDonorResponse[];
  createdAt: Date;
  updatedAt: Date;
}

const BloodDonorResponseSchema = new Schema<IBloodDonorResponse>(
  {
    donorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['offered', 'accepted', 'declined'],
      default: 'offered',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    requesterUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterName: { type: String, required: true },
    patientName: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      index: true,
    },
    unitsNeeded: { type: Number, required: true, min: 1, default: 1 },
    hospitalName: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true },
    contactNumber: { type: String, required: true },
    requiredDate: { type: Date, required: true },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'urgent',
    },
    reasonNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'fulfilled', 'cancelled'],
      default: 'open',
      index: true,
    },
    responses: [BloodDonorResponseSchema],
  },
  { timestamps: true }
);

export const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);


import mongoose, { Document, Schema } from 'mongoose';

export type OrganizationType = 'Pharmacy' | 'Hospital' | 'Clinic';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface IOrganization extends Document {
  name: string;
  type: OrganizationType;
  ownerUserId: mongoose.Types.ObjectId;
  ownerName: string;
  contactNumber: string;
  businessEmail: string;
  address: string;
  city: string;
  area: string;
  licenseNumber: string;
  licenseDocumentUrl?: string;
  additionalNotes?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Pharmacy', 'Hospital', 'Clinic'],
      required: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    businessEmail: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseDocumentUrl: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);


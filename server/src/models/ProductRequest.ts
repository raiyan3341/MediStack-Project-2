import mongoose, { Document, Schema } from 'mongoose';

export type RequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'fulfilled';

export interface IProductRequest extends Document {
  organizationId: mongoose.Types.ObjectId;
  organizationName: string;
  requestedByUserId: mongoose.Types.ObjectId;
  itemName: string;
  category?: string;
  expectedQuantity: number;
  urgency: 'low' | 'medium' | 'high';
  explanation: string;
  status: RequestStatus;
  adminResponse?: string;
  convertedProductId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductRequestSchema = new Schema<IProductRequest>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    organizationName: { type: String, required: true },
    requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, default: 'General Medical Supply' },
    expectedQuantity: { type: Number, required: true, min: 1 },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    explanation: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'fulfilled'],
      default: 'pending',
      index: true,
    },
    adminResponse: { type: String, default: '' },
    convertedProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  { timestamps: true }
);

export const ProductRequest = mongoose.model<IProductRequest>('ProductRequest', ProductRequestSchema);


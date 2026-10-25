import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryBatch extends Document {
  productId: mongoose.Types.ObjectId;
  batchNumber: string;
  quantity: number;
  initialQuantity: number;
  manufacturingDate?: Date;
  expiryDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryBatchSchema = new Schema<IInventoryBatch>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    batchNumber: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    initialQuantity: { type: Number, required: true, min: 0 },
    manufacturingDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true, index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const InventoryBatch = mongoose.model<IInventoryBatch>('InventoryBatch', InventoryBatchSchema);


import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  categoryId?: mongoose.Types.ObjectId;
  manufacturer: string;
  description: string;
  image: string;
  unit: string; // e.g., 'Box (10x10)', 'Bottle (100ml)', 'Strip (10 Tablets)', 'Pack'
  price: number;
  stock: number;
  lowStockThreshold: number;
  prescriptionRequired: boolean;
  isActive: boolean;
  batchNumber?: string | null;
  expiryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    manufacturer: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    unit: { type: String, required: true, default: 'Box' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 20 },
    prescriptionRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    batchNumber: { type: String, default: '' },
    expiryDate: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', manufacturer: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

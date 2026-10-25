import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  note?: string;
  timestamp: Date;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  organizationId: mongoose.Types.ObjectId;
  organizationName: string;
  organizationType: string;
  contactNumber: string;
  deliveryAddress: string;
  city: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  rejectionReason?: string;
  invoiceNumber: string;
  placedByUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true,
    },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    organizationName: { type: String, required: true },
    organizationType: { type: String, required: true },
    contactNumber: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    city: { type: String, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusHistory: [OrderStatusHistorySchema],
    rejectionReason: { type: String, default: '' },
    invoiceNumber: { type: String, required: true, unique: true },
    placedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);


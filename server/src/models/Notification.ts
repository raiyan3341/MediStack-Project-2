import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'order' | 'verification' | 'blood_request' | 'product_request' | 'stock_alert' | 'system';

export interface INotification extends Document {
  recipientUserId?: mongoose.Types.ObjectId;
  recipientRole?: string; // 'admin' | 'owner' | 'organization' | 'user'
  organizationId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    recipientRole: { type: String, default: '', index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
      default: null,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'verification', 'blood_request', 'product_request', 'stock_alert', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);


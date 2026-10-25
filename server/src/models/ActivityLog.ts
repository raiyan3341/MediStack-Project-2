import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  actorUserId?: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'Product' | 'Order' | 'Organization' | 'User' | 'Category' | 'BloodRequest' | 'System';
  entityId?: string;
  description: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['Product', 'Order', 'Organization', 'User', 'Category', 'BloodRequest', 'System'],
      required: true,
      index: true,
    },
    entityId: { type: String, default: '' },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);


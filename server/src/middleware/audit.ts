import { ActivityLog } from '../models/ActivityLog.js';
import { AuthenticatedRequest } from './auth.js';

export const logActivity = async (
  req: AuthenticatedRequest,
  action: string,
  entityType: 'Product' | 'Order' | 'Organization' | 'User' | 'Category' | 'BloodRequest' | 'System',
  entityId: string,
  description: string,
  details: Record<string, any> = {}
) => {
  try {
    const actorUserId = req.user?.id ? (req.user.id as any) : null;
    const actorName = req.user?.name || 'System / Guest';
    const actorRole = req.user?.role || 'system';

    await ActivityLog.create({
      actorUserId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      description,
      details,
    });
  } catch (error: any) {
    console.error('[Audit Logger Error]', error.message);
  }
};


import { Router, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth.js';

const router = Router();

// Get notifications for current user/role
router.get('/', verifyAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const orgId = req.user?.organizationId;

    const queryConditions: any[] = [{ recipientUserId: userId }];

    if (userRole === 'admin' || userRole === 'owner') {
      queryConditions.push({ recipientRole: 'admin' });
    }

    if (orgId) {
      queryConditions.push({ organizationId: orgId });
    }

    const notifications = await Notification.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: queryConditions,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark single notification as read
router.patch('/:id/read', verifyAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', verifyAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const orgId = req.user?.organizationId;

    const queryConditions: any[] = [{ recipientUserId: userId }];
    if (userRole === 'admin' || userRole === 'owner') {
      queryConditions.push({ recipientRole: 'admin' });
    }
    if (orgId) {
      queryConditions.push({ organizationId: orgId });
    }

    await Notification.updateMany({ $or: queryConditions, isRead: false }, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
});

export default router;


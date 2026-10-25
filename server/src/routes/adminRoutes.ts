import { Router, Response } from 'express';
import { User, UserRole } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Organization } from '../models/Organization.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest, verifyAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = Router();

// ==================== USER & ROLE MANAGEMENT (Owner & Admin) ====================

// Admin/Owner: List all users
router.get('/users', verifyAuth, requireRole('admin', 'owner'), async (req, res: Response): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const query: any = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.accountStatus = status;

    if (search) {
      const searchRegex = { $regex: String(search), $options: 'i' };
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// OWNER ONLY: Promote or Demote Admin
router.patch('/users/:id/role', verifyAuth, requireRole('owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body; // 'admin' | 'user' | 'organization'
    const allowedRoles: UserRole[] = ['admin', 'user', 'organization'];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role change. Owner can promote to Admin or demote to User/Organization.',
      });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role === 'owner') {
      res.status(403).json({ success: false, message: 'Owner account role cannot be modified.' });
      return;
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // Create notification for the user
    await Notification.create({
      recipientUserId: user._id,
      title: 'Account Role Updated',
      message: `Your platform role has been changed from ${previousRole.toUpperCase()} to ${role.toUpperCase()} by the Platform Owner.`,
      type: 'system',
      link: role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
    });

    await logActivity(
      req,
      'USER_ROLE_UPDATED',
      'User',
      (user._id as any).toString(),
      `Owner changed user ${user.name} (${user.email}) role from ${previousRole} to ${role}`
    );

    res.json({
      success: true,
      message: `User role successfully changed to ${role}.`,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
});

// Admin/Owner: Suspend or reactivate user
router.patch('/users/:id/status', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { accountStatus } = req.body;
    if (!['active', 'suspended'].includes(accountStatus)) {
      res.status(400).json({ success: false, message: 'accountStatus must be "active" or "suspended".' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role === 'owner') {
      res.status(403).json({ success: false, message: 'Cannot suspend the Owner account.' });
      return;
    }

    user.accountStatus = accountStatus;
    await user.save();

    await logActivity(
      req,
      user.accountStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      'User',
      (user._id as any).toString(),
      `${user.accountStatus === 'suspended' ? 'Suspended' : 'Reactivated'} account for ${user.name} (${user.email})`
    );

    res.json({
      success: true,
      message: `User account has been ${accountStatus}.`,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
});

// ==================== ACTIVITY & AUDIT LOGS ====================

// Admin/Owner: View activity logs
router.get('/activity-logs', verifyAuth, requireRole('admin', 'owner'), async (req, res: Response): Promise<void> => {
  try {
    const { entityType, action, limit = '50' } = req.query;
    const query: any = {};

    if (entityType && entityType !== 'All') query.entityType = entityType;
    if (action) query.action = { $regex: String(action), $options: 'i' };

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(200, parseInt(String(limit), 10) || 50));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs', error: error.message });
  }
});

// ==================== REPORTS & ANALYTICS (Recharts datasets) ====================

// Admin/Owner: Summary KPIs and Recharts analytics
router.get('/reports/summary', verifyAuth, requireRole('admin', 'owner'), async (_req, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalOrgs,
      approvedOrgs,
      pendingOrgs,
      totalProducts,
      lowStockProducts,
      orders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Organization.countDocuments(),
      Organization.countDocuments({ verificationStatus: 'approved' }),
      Organization.countDocuments({ verificationStatus: 'pending' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      }),
      Order.find({ status: { $ne: 'cancelled' } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Organization types breakdown
    const orgBreakdown = await Organization.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Order status breakdown
    const orderStatusBreakdown = [
      { name: 'Pending', count: pendingOrders, fill: '#f59e0b' },
      { name: 'Confirmed', count: confirmedOrders, fill: '#3b82f6' },
      { name: 'Processing', count: processingOrders, fill: '#8b5cf6' },
      { name: 'Shipped', count: shippedOrders, fill: '#06b6d4' },
      { name: 'Delivered', count: deliveredOrders, fill: '#10b981' },
      { name: 'Cancelled', count: cancelledOrders, fill: '#ef4444' },
    ];

    // Monthly trends for Recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { month: string; orders: number; volume: number }> = {};
    
    // Seed default current 6 months
    const currentMonthIdx = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      const mName = months[idx];
      monthlyDataMap[mName] = { month: mName, orders: 0, volume: 0 };
    }

    for (const ord of orders) {
      const ordMonth = months[new Date(ord.createdAt).getMonth()];
      if (monthlyDataMap[ordMonth]) {
        monthlyDataMap[ordMonth].orders += 1;
        monthlyDataMap[ordMonth].volume += ord.totalAmount;
      }
    }

    const monthlyTrends = Object.values(monthlyDataMap);

    res.json({
      success: true,
      kpis: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalOrgs,
        approvedOrgs,
        pendingOrgs,
        totalProducts,
        lowStockProducts,
      },
      charts: {
        monthlyTrends,
        orderStatusBreakdown,
        orgTypeDistribution: orgBreakdown.map((item) => ({
          type: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate report summary', error: error.message });
  }
});

// Admin/Owner: Export orders to CSV
router.get('/reports/export-csv', verifyAuth, requireRole('admin', 'owner'), async (_req, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    let csv = 'OrderNumber,InvoiceNumber,Organization,Type,Contact,City,TotalAmount,Status,OrderDate\n';

    for (const o of orders) {
      const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
      const safeOrg = `"${o.organizationName.replace(/"/g, '""')}"`;
      const safeCity = `"${o.city.replace(/"/g, '""')}"`;
      csv += `${o.orderNumber},${o.invoiceNumber},${safeOrg},${o.organizationType},${o.contactNumber},${safeCity},${o.totalAmount},${o.status},${dateStr}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=medistock-orders-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export CSV', error: error.message });
  }
});

export default router;


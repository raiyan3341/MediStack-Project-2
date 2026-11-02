"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_js_1 = require("../models/User.js");
const Order_js_1 = require("../models/Order.js");
const Product_js_1 = require("../models/Product.js");
const Organization_js_1 = require("../models/Organization.js");
const ActivityLog_js_1 = require("../models/ActivityLog.js");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// ==================== USER & ROLE MANAGEMENT (Owner & Admin) ====================
// Admin/Owner: List all users
router.get('/users', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const query = {};
        if (role && role !== 'All')
            query.role = role;
        if (status && status !== 'All')
            query.accountStatus = status;
        if (search) {
            const searchRegex = { $regex: String(search), $options: 'i' };
            query.$or = [{ name: searchRegex }, { email: searchRegex }];
        }
        const users = await User_js_1.User.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
});
// OWNER ONLY: Promote or Demote Admin
router.patch('/users/:id/role', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { role } = req.body; // 'admin' | 'user' | 'organization'
        const allowedRoles = ['admin', 'user', 'organization'];
        if (!allowedRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role change. Owner can promote to Admin or demote to User/Organization.',
            });
            return;
        }
        const user = await User_js_1.User.findById(req.params.id);
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
        await Notification_js_1.Notification.create({
            recipientUserId: user._id,
            title: 'Account Role Updated',
            message: `Your platform role has been changed from ${previousRole.toUpperCase()} to ${role.toUpperCase()} by the Platform Owner.`,
            type: 'system',
            link: role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
        });
        await (0, audit_js_1.logActivity)(req, 'USER_ROLE_UPDATED', 'User', user._id.toString(), `Owner changed user ${user.name} (${user.email}) role from ${previousRole} to ${role}`);
        res.json({
            success: true,
            message: `User role successfully changed to ${role}.`,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
    }
});
// Admin/Owner: Suspend or reactivate user
router.patch('/users/:id/status', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { accountStatus } = req.body;
        if (!['active', 'suspended'].includes(accountStatus)) {
            res.status(400).json({ success: false, message: 'accountStatus must be "active" or "suspended".' });
            return;
        }
        const user = await User_js_1.User.findById(req.params.id);
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
        await (0, audit_js_1.logActivity)(req, user.accountStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED', 'User', user._id.toString(), `${user.accountStatus === 'suspended' ? 'Suspended' : 'Reactivated'} account for ${user.name} (${user.email})`);
        res.json({
            success: true,
            message: `User account has been ${accountStatus}.`,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
    }
});
// ==================== ACTIVITY & AUDIT LOGS ====================
// Admin/Owner: View activity logs
router.get('/activity-logs', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { entityType, action, limit = '50' } = req.query;
        const query = {};
        if (entityType && entityType !== 'All')
            query.entityType = entityType;
        if (action)
            query.action = { $regex: String(action), $options: 'i' };
        const logs = await ActivityLog_js_1.ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(200, parseInt(String(limit), 10) || 50));
        res.json({ success: true, count: logs.length, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs', error: error.message });
    }
});
// ==================== REPORTS & ANALYTICS (Recharts datasets) ====================
// Admin/Owner: Summary KPIs and Recharts analytics
router.get('/reports/summary', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (_req, res) => {
    try {
        const [totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, totalOrgs, approvedOrgs, pendingOrgs, totalProducts, lowStockProducts, orders,] = await Promise.all([
            Order_js_1.Order.countDocuments(),
            Order_js_1.Order.countDocuments({ status: 'pending' }),
            Order_js_1.Order.countDocuments({ status: 'confirmed' }),
            Order_js_1.Order.countDocuments({ status: 'processing' }),
            Order_js_1.Order.countDocuments({ status: 'shipped' }),
            Order_js_1.Order.countDocuments({ status: 'delivered' }),
            Order_js_1.Order.countDocuments({ status: 'cancelled' }),
            Organization_js_1.Organization.countDocuments(),
            Organization_js_1.Organization.countDocuments({ verificationStatus: 'approved' }),
            Organization_js_1.Organization.countDocuments({ verificationStatus: 'pending' }),
            Product_js_1.Product.countDocuments({ isActive: true }),
            Product_js_1.Product.countDocuments({
                isActive: true,
                $expr: { $lte: ['$stock', '$lowStockThreshold'] },
            }),
            Order_js_1.Order.find({ status: { $ne: 'cancelled' } }),
        ]);
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        // Organization types breakdown
        const orgBreakdown = await Organization_js_1.Organization.aggregate([
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
        const monthlyDataMap = {};
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate report summary', error: error.message });
    }
});
// Admin/Owner: Export orders to CSV
router.get('/reports/export-csv', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (_req, res) => {
    try {
        const orders = await Order_js_1.Order.find().sort({ createdAt: -1 });
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export CSV', error: error.message });
    }
});
exports.default = router;

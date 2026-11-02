"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Get notifications for current user/role
router.get('/', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const orgId = req.user?.organizationId;
        const queryConditions = [{ recipientUserId: userId }];
        if (userRole === 'admin' || userRole === 'owner') {
            queryConditions.push({ recipientRole: 'admin' });
        }
        if (orgId) {
            queryConditions.push({ organizationId: orgId });
        }
        const notifications = await Notification_js_1.Notification.find({ $or: queryConditions })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification_js_1.Notification.countDocuments({
            $or: queryConditions,
            isRead: false,
        });
        res.json({
            success: true,
            unreadCount,
            data: notifications,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
});
// Mark single notification as read
router.patch('/:id/read', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const notification = await Notification_js_1.Notification.findById(req.params.id);
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.json({ success: true, message: 'Notification marked as read', data: notification });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
    }
});
// Mark all notifications as read
router.patch('/read-all', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const orgId = req.user?.organizationId;
        const queryConditions = [{ recipientUserId: userId }];
        if (userRole === 'admin' || userRole === 'owner') {
            queryConditions.push({ recipientRole: 'admin' });
        }
        if (orgId) {
            queryConditions.push({ organizationId: orgId });
        }
        await Notification_js_1.Notification.updateMany({ $or: queryConditions, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
    }
});
exports.default = router;

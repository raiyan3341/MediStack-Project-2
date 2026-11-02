"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Organization_js_1 = require("../models/Organization.js");
const User_js_1 = require("../models/User.js");
const Order_js_1 = require("../models/Order.js");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// Organization User: Register an organization
router.post('/register', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { name, type, ownerName, contactNumber, businessEmail, address, city, area, licenseNumber, licenseDocumentUrl, additionalNotes, } = req.body;
        if (!name || !type || !ownerName || !contactNumber || !businessEmail || !address || !city || !licenseNumber) {
            res.status(400).json({ success: false, message: 'Please provide all required organization registration fields.' });
            return;
        }
        const userId = req.user?.id;
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Check if user already registered an organization
        const existingOrg = await Organization_js_1.Organization.findOne({ ownerUserId: user._id });
        if (existingOrg) {
            res.status(400).json({
                success: false,
                message: `You have already registered an organization (${existingOrg.name}) with status: ${existingOrg.verificationStatus}.`,
            });
            return;
        }
        const organization = await Organization_js_1.Organization.create({
            name: name.trim(),
            type,
            ownerUserId: user._id,
            ownerName: ownerName.trim(),
            contactNumber: contactNumber.trim(),
            businessEmail: businessEmail.trim().toLowerCase(),
            address: address.trim(),
            city: city.trim(),
            area: area.trim(),
            licenseNumber: licenseNumber.trim(),
            licenseDocumentUrl: licenseDocumentUrl || '',
            additionalNotes: additionalNotes || '',
            verificationStatus: 'pending',
        });
        // Link organization with user
        user.organizationId = organization._id;
        user.role = 'organization';
        await user.save();
        // Create admin notification
        await Notification_js_1.Notification.create({
            recipientRole: 'admin',
            title: 'New Organization Registration',
            message: `${organization.name} (${organization.type}) submitted registration documents for verification.`,
            type: 'verification',
            link: `/admin/organizations/${organization._id}`,
        });
        await (0, audit_js_1.logActivity)(req, 'ORG_REGISTERED', 'Organization', organization._id.toString(), `Registered organization: ${organization.name} (${organization.type}) - Verification pending`);
        res.status(201).json({
            success: true,
            message: 'Organization registered successfully! An administrator will review your application soon.',
            data: organization,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Organization registration failed', error: error.message });
    }
});
// Organization User: Get own organization profile
router.get('/me', auth_js_1.verifyAuth, async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            res.status(404).json({ success: false, message: 'No registered organization profile found for this account.' });
            return;
        }
        const org = await Organization_js_1.Organization.findById(req.user.organizationId);
        if (!org) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        res.json({ success: true, data: org });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch organization details', error: error.message });
    }
});
// Organization User: Update own organization details
router.put('/me', auth_js_1.verifyAuth, async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            res.status(404).json({ success: false, message: 'No organization linked to account' });
            return;
        }
        const org = await Organization_js_1.Organization.findById(req.user.organizationId);
        if (!org) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        const { contactNumber, businessEmail, address, city, area, additionalNotes } = req.body;
        if (contactNumber)
            org.contactNumber = contactNumber;
        if (businessEmail)
            org.businessEmail = businessEmail;
        if (address)
            org.address = address;
        if (city)
            org.city = city;
        if (area)
            org.area = area;
        if (additionalNotes !== undefined)
            org.additionalNotes = additionalNotes;
        await org.save();
        res.json({ success: true, message: 'Organization details updated successfully', data: org });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update organization', error: error.message });
    }
});
// Admin/Owner: List all organizations with filters & search
router.get('/', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, type, search } = req.query;
        const query = {};
        if (status && status !== 'All') {
            query.verificationStatus = status;
        }
        if (type && type !== 'All') {
            query.type = type;
        }
        if (search) {
            const searchRegex = { $regex: String(search), $options: 'i' };
            query.$or = [
                { name: searchRegex },
                { ownerName: searchRegex },
                { licenseNumber: searchRegex },
                { city: searchRegex },
                { businessEmail: searchRegex },
            ];
        }
        const organizations = await Organization_js_1.Organization.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: organizations.length, data: organizations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to list organizations', error: error.message });
    }
});
// Admin/Owner: Dedicated Organization Profile & Purchase History (Section 5)
router.get('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const organization = await Organization_js_1.Organization.findById(req.params.id).populate('ownerUserId', 'name email');
        if (!organization) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        // Load full order history for this specific organization
        const orders = await Order_js_1.Order.find({ organizationId: organization._id }).sort({ createdAt: -1 });
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        const completedOrders = orders.filter((o) => o.status === 'delivered').length;
        const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
        const totalSpent = orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        // Compute most frequently ordered products
        const productFrequencyMap = {};
        for (const order of orders) {
            if (order.status === 'cancelled')
                continue;
            for (const item of order.items) {
                const pId = item.productId.toString();
                if (!productFrequencyMap[pId]) {
                    productFrequencyMap[pId] = {
                        name: item.name,
                        sku: item.sku,
                        count: 0,
                        totalSpent: 0,
                    };
                }
                productFrequencyMap[pId].count += item.quantity;
                productFrequencyMap[pId].totalSpent += item.subtotal;
            }
        }
        const topOrderedProducts = Object.values(productFrequencyMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        res.json({
            success: true,
            data: {
                organization,
                analytics: {
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    cancelledOrders,
                    totalSpent,
                    topOrderedProducts,
                },
                orders,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch organization details', error: error.message });
    }
});
// Admin/Owner: Verify organization (Approve or Reject with reason)
router.patch('/:id/verify', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body; // status: 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({ success: false, message: 'Status must be "approved" or "rejected".' });
            return;
        }
        if (status === 'rejected' && !rejectionReason) {
            res.status(400).json({ success: false, message: 'Please provide a reason for rejecting the application.' });
            return;
        }
        const organization = await Organization_js_1.Organization.findById(req.params.id);
        if (!organization) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        organization.verificationStatus = status;
        organization.rejectionReason = status === 'rejected' ? rejectionReason : '';
        organization.reviewedBy = req.user?.id;
        organization.reviewedAt = new Date();
        await organization.save();
        // Send notification to organization owner
        await Notification_js_1.Notification.create({
            recipientUserId: organization.ownerUserId,
            organizationId: organization._id,
            title: `Organization Registration ${status === 'approved' ? 'Approved' : 'Declined'}`,
            message: status === 'approved'
                ? `Congratulations! Your organization "${organization.name}" has been verified. You can now place supply orders.`
                : `Your organization registration for "${organization.name}" was rejected. Reason: ${rejectionReason}`,
            type: 'verification',
            link: '/organization/dashboard',
        });
        await (0, audit_js_1.logActivity)(req, status === 'approved' ? 'ORG_APPROVED' : 'ORG_REJECTED', 'Organization', organization._id.toString(), `${status === 'approved' ? 'Approved' : 'Rejected'} verification for: ${organization.name} (${organization.type})`);
        res.json({
            success: true,
            message: `Organization has been ${status} successfully.`,
            data: organization,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update verification status', error: error.message });
    }
});
// Admin/Owner: Suspend or reactivate organization
router.patch('/:id/status', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { isSuspended } = req.body;
        const organization = await Organization_js_1.Organization.findById(req.params.id);
        if (!organization) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        organization.isSuspended = Boolean(isSuspended);
        await organization.save();
        await (0, audit_js_1.logActivity)(req, organization.isSuspended ? 'ORG_SUSPENDED' : 'ORG_REACTIVATED', 'Organization', organization._id.toString(), `${organization.isSuspended ? 'Suspended' : 'Reactivated'} organization: ${organization.name}`);
        res.json({
            success: true,
            message: `Organization ${organization.isSuspended ? 'suspended' : 'reactivated'} successfully.`,
            data: organization,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle organization status', error: error.message });
    }
});
exports.default = router;

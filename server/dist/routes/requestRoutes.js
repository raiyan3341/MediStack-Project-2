"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductRequest_js_1 = require("../models/ProductRequest.js");
const Product_js_1 = require("../models/Product.js");
const Organization_js_1 = require("../models/Organization.js");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// Organization: Submit special product demand request
router.post('/', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const org = await Organization_js_1.Organization.findById(orgId);
        if (!org) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        const { itemName, category, expectedQuantity, urgency, explanation } = req.body;
        if (!itemName || !expectedQuantity || !explanation) {
            res.status(400).json({ success: false, message: 'Item name, expected quantity, and explanation are required.' });
            return;
        }
        const productRequest = await ProductRequest_js_1.ProductRequest.create({
            organizationId: org._id,
            organizationName: org.name,
            requestedByUserId: req.user?.id,
            itemName: itemName.trim(),
            category: category || 'General Medical Supply',
            expectedQuantity: Number(expectedQuantity),
            urgency: urgency || 'medium',
            explanation: explanation.trim(),
            status: 'pending',
        });
        // Notify admins
        await Notification_js_1.Notification.create({
            recipientRole: 'admin',
            title: 'New Product Demand Request',
            message: `${org.name} requested "${itemName}" (${expectedQuantity} units).`,
            type: 'product_request',
            link: '/admin/requests',
        });
        await (0, audit_js_1.logActivity)(req, 'PRODUCT_REQUEST_SUBMITTED', 'Organization', productRequest._id.toString(), `${org.name} requested item: ${itemName} (${expectedQuantity} units)`);
        res.status(201).json({
            success: true,
            message: 'Product demand request submitted. Platform administrators will review your request.',
            data: productRequest,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit request', error: error.message });
    }
});
// Organization: Get own product requests
router.get('/my', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('organization'), async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const requests = await ProductRequest_js_1.ProductRequest.find({ organizationId: orgId }).sort({ createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your requests', error: error.message });
    }
});
// Admin/Owner: Get all product requests with status filter
router.get('/', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, urgency } = req.query;
        const query = {};
        if (status && status !== 'All')
            query.status = status;
        if (urgency && urgency !== 'All')
            query.urgency = urgency;
        const requests = await ProductRequest_js_1.ProductRequest.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
    }
});
// Admin/Owner: Review request (approve, reject, mark under review, convert to catalog)
router.patch('/:id/review', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, adminResponse, createCatalogProduct, productDetails } = req.body;
        const productRequest = await ProductRequest_js_1.ProductRequest.findById(req.params.id);
        if (!productRequest) {
            res.status(404).json({ success: false, message: 'Product request not found' });
            return;
        }
        productRequest.status = status;
        if (adminResponse !== undefined)
            productRequest.adminResponse = adminResponse;
        // Optional: convert approved request directly into a catalog item
        if (status === 'approved' && createCatalogProduct && productDetails) {
            const newProduct = await Product_js_1.Product.create({
                name: productDetails.name || productRequest.itemName,
                sku: productDetails.sku || `SKU-REQ-${Date.now().toString().slice(-5)}`,
                category: productDetails.category || productRequest.category,
                manufacturer: productDetails.manufacturer || 'Approved Supplier',
                description: productDetails.description || productRequest.explanation,
                unit: productDetails.unit || 'Box',
                price: Number(productDetails.price) || 0,
                stock: Number(productDetails.stock) || productRequest.expectedQuantity,
                image: productDetails.image || '',
                prescriptionRequired: Boolean(productDetails.prescriptionRequired),
                isActive: true,
            });
            productRequest.convertedProductId = newProduct._id;
            productRequest.status = 'fulfilled';
            await (0, audit_js_1.logActivity)(req, 'REQUEST_CONVERTED_TO_PRODUCT', 'Product', newProduct._id.toString(), `Converted demand request "${productRequest.itemName}" into catalog item: ${newProduct.name}`);
        }
        await productRequest.save();
        // Send notification to requesting organization
        await Notification_js_1.Notification.create({
            organizationId: productRequest.organizationId,
            recipientUserId: productRequest.requestedByUserId,
            title: `Product Request ${status.toUpperCase().replace('_', ' ')}`,
            message: `Your request for "${productRequest.itemName}" is now ${status.toUpperCase()}.${adminResponse ? ` Admin Response: ${adminResponse}` : ''}`,
            type: 'product_request',
            link: '/organization/requests',
        });
        await (0, audit_js_1.logActivity)(req, 'PRODUCT_REQUEST_REVIEWED', 'Organization', productRequest.organizationId.toString(), `Reviewed request for "${productRequest.itemName}" -> ${status}`);
        res.json({
            success: true,
            message: 'Product demand request reviewed successfully.',
            data: productRequest,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update request', error: error.message });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_js_1 = require("../models/Order.js");
const Cart_js_1 = require("../models/Cart.js");
const Product_js_1 = require("../models/Product.js");
const Organization_js_1 = require("../models/Organization.js");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// ==================== CART ROUTES ====================
// Organization: Get current shopping cart
router.get('/cart', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        let cart = await Cart_js_1.Cart.findOne({ organizationId: orgId }).populate('items.productId');
        if (!cart) {
            cart = await Cart_js_1.Cart.create({
                organizationId: orgId,
                userId: req.user?.id,
                items: [],
            });
        }
        // Clean up items where product no longer exists
        const validItems = cart.items.filter((item) => item.productId !== null);
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }
        // Calculate subtotal & check stock warnings
        let total = 0;
        const formattedItems = cart.items.map((item) => {
            const prod = item.productId;
            const subtotal = (prod?.price || 0) * item.quantity;
            total += subtotal;
            return {
                product: prod,
                quantity: item.quantity,
                subtotal,
                isOutOfStock: prod ? prod.stock < item.quantity : true,
            };
        });
        res.json({
            success: true,
            cartId: cart._id,
            items: formattedItems,
            totalAmount: total,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch cart', error: error.message });
    }
});
// Organization: Add / Update item in cart
router.post('/cart', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const { productId, quantity } = req.body;
        if (!productId || quantity === undefined) {
            res.status(400).json({ success: false, message: 'productId and quantity are required.' });
            return;
        }
        const product = await Product_js_1.Product.findById(productId);
        if (!product || !product.isActive) {
            res.status(404).json({ success: false, message: 'Product is unavailable or does not exist.' });
            return;
        }
        let cart = await Cart_js_1.Cart.findOne({ organizationId: orgId });
        if (!cart) {
            cart = new Cart_js_1.Cart({
                organizationId: orgId,
                userId: req.user?.id,
                items: [],
            });
        }
        const existingIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());
        const qty = parseInt(quantity, 10);
        if (qty <= 0) {
            if (existingIndex > -1) {
                cart.items.splice(existingIndex, 1);
            }
        }
        else {
            if (existingIndex > -1) {
                cart.items[existingIndex].quantity = qty;
            }
            else {
                cart.items.push({ productId: product._id, quantity: qty });
            }
        }
        await cart.save();
        res.json({ success: true, message: 'Cart updated successfully', cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update cart', error: error.message });
    }
});
// Organization: Remove item from cart
router.delete('/cart/:productId', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const cart = await Cart_js_1.Cart.findOne({ organizationId: orgId });
        if (cart) {
            cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId.toString());
            await cart.save();
        }
        res.json({ success: true, message: 'Item removed from cart' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove cart item', error: error.message });
    }
});
// Organization: Clear cart
router.delete('/cart', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        await Cart_js_1.Cart.findOneAndUpdate({ organizationId: orgId }, { items: [] });
        res.json({ success: true, message: 'Cart cleared' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear cart', error: error.message });
    }
});
// ==================== ORDER CHECKOUT & CREATION ====================
// Organization: Checkout and place order
router.post('/checkout', auth_js_1.verifyAuth, auth_js_1.requireApprovedOrganization, async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const org = await Organization_js_1.Organization.findById(orgId);
        if (!org) {
            res.status(404).json({ success: false, message: 'Organization profile not found' });
            return;
        }
        let itemsToOrder = req.body.items;
        // If items not directly supplied in body, read from user's cart
        if (!itemsToOrder || itemsToOrder.length === 0) {
            const cart = await Cart_js_1.Cart.findOne({ organizationId: orgId });
            if (!cart || cart.items.length === 0) {
                res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
                return;
            }
            itemsToOrder = cart.items.map((i) => ({
                productId: i.productId.toString(),
                quantity: i.quantity,
            }));
        }
        // Step 2 & 3: Validate live prices, active status, and sufficient stock from DB
        const validatedItems = [];
        let calculatedTotal = 0;
        for (const item of itemsToOrder) {
            const product = await Product_js_1.Product.findById(item.productId);
            if (!product || !product.isActive) {
                res.status(400).json({
                    success: false,
                    message: `Product "${product?.name || 'Selected item'}" is currently unavailable.`,
                });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}.`,
                });
                return;
            }
            // Check expiry date
            if (product.expiryDate && new Date(product.expiryDate) < new Date()) {
                res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" has expired and cannot be ordered.`,
                });
                return;
            }
            const itemSubtotal = product.price * item.quantity;
            calculatedTotal += itemSubtotal;
            validatedItems.push({
                productId: product._id,
                name: product.name,
                sku: product.sku,
                category: product.category,
                unit: product.unit,
                unitPrice: product.price, // Server price used
                quantity: item.quantity,
                subtotal: itemSubtotal,
            });
        }
        // Concurrency-safe atomic stock deduction
        for (const vItem of validatedItems) {
            await Product_js_1.Product.findByIdAndUpdate(vItem.productId, {
                $inc: { stock: -vItem.quantity },
            });
        }
        // Generate unique order number & invoice number
        const count = await Order_js_1.Order.countDocuments();
        const orderNumber = `MS-ORD-${(1001 + count).toString()}`;
        const invoiceNumber = `MS-INV-${(1001 + count).toString()}`;
        const order = await Order_js_1.Order.create({
            orderNumber,
            organizationId: org._id,
            organizationName: org.name,
            organizationType: org.type,
            contactNumber: req.body.contactNumber || org.contactNumber,
            deliveryAddress: req.body.deliveryAddress || org.address,
            city: req.body.city || org.city,
            items: validatedItems,
            totalAmount: calculatedTotal,
            status: 'pending',
            statusHistory: [
                {
                    status: 'pending',
                    note: 'Supply order submitted and awaiting administrator confirmation.',
                    timestamp: new Date(),
                    updatedBy: org.name,
                },
            ],
            invoiceNumber,
            placedByUserId: req.user?.id,
        });
        // Clear cart upon successful order
        await Cart_js_1.Cart.findOneAndUpdate({ organizationId: orgId }, { items: [] });
        // Notify administrators
        await Notification_js_1.Notification.create({
            recipientRole: 'admin',
            title: 'New Supply Order Received',
            message: `${org.name} placed a new order ${order.orderNumber} worth $${order.totalAmount.toLocaleString()}.`,
            type: 'order',
            link: `/admin/orders/${order._id}`,
        });
        await (0, audit_js_1.logActivity)(req, 'ORDER_PLACED', 'Order', order._id.toString(), `Order ${order.orderNumber} placed by ${org.name} for $${order.totalAmount}`);
        res.status(201).json({
            success: true,
            message: 'Supply order placed successfully! You can track its status in your dashboard.',
            order,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
    }
});
// Organization: Get own order history
router.get('/my-orders', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('organization'), async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) {
            res.status(403).json({ success: false, message: 'No organization linked to account.' });
            return;
        }
        const { status, search } = req.query;
        const query = { organizationId: orgId };
        if (status && status !== 'All') {
            query.status = status;
        }
        if (search) {
            const searchRegex = { $regex: String(search), $options: 'i' };
            query.$or = [{ orderNumber: searchRegex }, { invoiceNumber: searchRegex }];
        }
        const orders = await Order_js_1.Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order history', error: error.message });
    }
});
// Organization: Get single order details and invoice data
router.get('/my-orders/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('organization'), async (req, res) => {
    try {
        const orgId = req.user?.organizationId;
        const order = await Order_js_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        // Security check: Organization must only see its own orders
        if (order.organizationId.toString() !== orgId?.toString()) {
            res.status(403).json({ success: false, message: 'Access denied. You cannot view another organization’s orders.' });
            return;
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
});
// ==================== ADMIN ORDER MANAGEMENT ====================
// Admin/Owner: Get all platform orders
router.get('/', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, organizationId, organizationType, search, startDate, endDate } = req.query;
        const query = {};
        if (status && status !== 'All')
            query.status = status;
        if (organizationId)
            query.organizationId = organizationId;
        if (organizationType && organizationType !== 'All')
            query.organizationType = organizationType;
        if (search) {
            const searchRegex = { $regex: String(search), $options: 'i' };
            query.$or = [
                { orderNumber: searchRegex },
                { organizationName: searchRegex },
                { invoiceNumber: searchRegex },
            ];
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(String(startDate));
            if (endDate)
                query.createdAt.$lte = new Date(String(endDate));
        }
        const orders = await Order_js_1.Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
});
// Admin/Owner: Get single order
router.get('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const order = await Order_js_1.Order.findById(req.params.id).populate('organizationId');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
});
// Admin/Owner: Update order status workflow (Confirmed, Processing, Shipped, Delivered, Cancelled)
router.patch('/:id/status', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { status, note, rejectionReason } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
            return;
        }
        const order = await Order_js_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        const previousStatus = order.status;
        // If order is transitioning to 'cancelled' from an active state, restore inventory quantities!
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            for (const item of order.items) {
                await Product_js_1.Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity },
                });
            }
            order.rejectionReason = rejectionReason || note || 'Cancelled by administrator.';
        }
        order.status = status;
        order.statusHistory.push({
            status,
            note: note || `Order status updated to ${status}.`,
            timestamp: new Date(),
            updatedBy: req.user?.name || 'Administrator',
        });
        await order.save();
        // Send notification to organization
        await Notification_js_1.Notification.create({
            organizationId: order.organizationId,
            recipientUserId: order.placedByUserId,
            title: `Order Status Updated: ${order.orderNumber}`,
            message: `Your order ${order.orderNumber} is now ${status.toUpperCase()}.${note ? ` Note: ${note}` : ''}`,
            type: 'order',
            link: `/organization/orders/${order._id}`,
        });
        await (0, audit_js_1.logActivity)(req, 'ORDER_STATUS_CHANGED', 'Order', order._id.toString(), `Changed order ${order.orderNumber} status from ${previousStatus} to ${status}`);
        res.json({
            success: true,
            message: `Order status updated to ${status} successfully.`,
            order,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
    }
});
exports.default = router;

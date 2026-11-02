"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_js_1 = require("../models/Product.js");
const InventoryBatch_js_1 = require("../models/InventoryBatch.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// Public / Organization: Get products catalog with filtering, search, and pagination
router.get('/', async (req, res) => {
    try {
        const { search, category, manufacturer, inStockOnly, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '12', } = req.query;
        const query = { isActive: true };
        if (category && category !== 'All') {
            query.category = category;
        }
        if (manufacturer) {
            query.manufacturer = { $regex: String(manufacturer), $options: 'i' };
        }
        if (inStockOnly === 'true') {
            query.stock = { $gt: 0 };
        }
        if (search) {
            const searchRegex = { $regex: String(search), $options: 'i' };
            query.$or = [
                { name: searchRegex },
                { sku: searchRegex },
                { manufacturer: searchRegex },
                { category: searchRegex },
                { description: searchRegex },
            ];
        }
        const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
        const limitNum = Math.max(1, parseInt(String(limit), 10) || 12);
        const skip = (pageNum - 1) * limitNum;
        const sortObj = {};
        if (sortBy === 'price_asc')
            sortObj.price = 1;
        else if (sortBy === 'price_desc')
            sortObj.price = -1;
        else if (sortBy === 'name_asc')
            sortObj.name = 1;
        else if (sortBy === 'stock_desc')
            sortObj.stock = -1;
        else
            sortObj[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;
        const [products, totalCount] = await Promise.all([
            Product_js_1.Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
            Product_js_1.Product.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
            },
        });
    }
    catch (error) {
        console.error('[Products Fetch Warning]:', error.message);
        res.status(200).json({
            success: true,
            data: [],
            pagination: {
                page: 1,
                limit: 12,
                totalCount: 0,
                totalPages: 0,
            },
            warning: error.message,
        });
    }
});
// Admin/Owner: Inventory Alerts (Low stock and near-expiry / expired)
router.get('/inventory/alerts', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (_req, res) => {
    try {
        const now = new Date();
        const ninetyDaysAhead = new Date();
        ninetyDaysAhead.setDate(now.getDate() + 90);
        // 1. Low stock products (stock <= lowStockThreshold)
        const lowStockProducts = await Product_js_1.Product.find({
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        }).sort({ stock: 1 });
        // 2. Near-expiry or expired products
        const expiringProducts = await Product_js_1.Product.find({
            isActive: true,
            expiryDate: { $ne: null, $lte: ninetyDaysAhead },
        }).sort({ expiryDate: 1 });
        // 3. Batches near expiry
        const expiringBatches = await InventoryBatch_js_1.InventoryBatch.find({
            quantity: { $gt: 0 },
            expiryDate: { $lte: ninetyDaysAhead },
        })
            .populate('productId', 'name sku category')
            .sort({ expiryDate: 1 });
        res.json({
            success: true,
            lowStockCount: lowStockProducts.length,
            expiringCount: expiringProducts.length,
            lowStockProducts,
            expiringProducts,
            expiringBatches,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch inventory alerts', error: error.message });
    }
});
// Public / Organization: Get single product detail
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_js_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        // Also get active batches for this product
        const batches = await InventoryBatch_js_1.InventoryBatch.find({
            productId: product._id,
            quantity: { $gt: 0 },
        }).sort({ expiryDate: 1 });
        res.json({
            success: true,
            data: product,
            batches,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product details', error: error.message });
    }
});
// Admin/Owner: Create new product
router.post('/', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { name, sku, category, categoryId, manufacturer, description, image, unit, price, stock, lowStockThreshold, prescriptionRequired, batchNumber, expiryDate, } = req.body;
        if (!name || !sku || !category || !manufacturer || price === undefined || stock === undefined) {
            res.status(400).json({ success: false, message: 'Please provide all required product fields' });
            return;
        }
        const existingSku = await Product_js_1.Product.findOne({ sku: sku.toUpperCase().trim() });
        if (existingSku) {
            res.status(400).json({ success: false, message: `A product with SKU ${sku.toUpperCase()} already exists` });
            return;
        }
        const product = await Product_js_1.Product.create({
            name: name.trim(),
            sku: sku.toUpperCase().trim(),
            category: category.trim(),
            categoryId: categoryId || null,
            manufacturer: manufacturer.trim(),
            description: description || '',
            image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
            unit: unit || 'Box',
            price: Number(price),
            stock: Number(stock),
            lowStockThreshold: Number(lowStockThreshold) || 20,
            prescriptionRequired: Boolean(prescriptionRequired),
            isActive: true,
            batchNumber: batchNumber || `BCH-${Date.now().toString().slice(-6)}`,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
        });
        // Create initial inventory batch if batch info is provided and stock > 0
        if (Number(stock) > 0 && expiryDate) {
            await InventoryBatch_js_1.InventoryBatch.create({
                productId: product._id,
                batchNumber: product.batchNumber,
                quantity: Number(stock),
                initialQuantity: Number(stock),
                expiryDate: new Date(expiryDate),
                notes: 'Initial stock entry',
            });
        }
        await (0, audit_js_1.logActivity)(req, 'PRODUCT_CREATED', 'Product', product._id.toString(), `Created product: ${product.name} (SKU: ${product.sku}, Stock: ${product.stock})`);
        res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
});
// Admin/Owner: Update product
router.put('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const product = await Product_js_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const { name, sku, category, categoryId, manufacturer, description, image, unit, price, stock, lowStockThreshold, prescriptionRequired, isActive, batchNumber, expiryDate, } = req.body;
        if (sku && sku.toUpperCase() !== product.sku) {
            const existingSku = await Product_js_1.Product.findOne({ sku: sku.toUpperCase() });
            if (existingSku) {
                res.status(400).json({ success: false, message: `SKU ${sku.toUpperCase()} is already in use by another product` });
                return;
            }
            product.sku = sku.toUpperCase().trim();
        }
        if (name)
            product.name = name.trim();
        if (category)
            product.category = category.trim();
        if (categoryId !== undefined)
            product.categoryId = categoryId;
        if (manufacturer)
            product.manufacturer = manufacturer.trim();
        if (description !== undefined)
            product.description = description;
        if (image !== undefined)
            product.image = image;
        if (unit)
            product.unit = unit;
        if (price !== undefined)
            product.price = Number(price);
        if (stock !== undefined)
            product.stock = Math.max(0, Number(stock));
        if (lowStockThreshold !== undefined)
            product.lowStockThreshold = Number(lowStockThreshold);
        if (prescriptionRequired !== undefined)
            product.prescriptionRequired = Boolean(prescriptionRequired);
        if (isActive !== undefined)
            product.isActive = Boolean(isActive);
        if (batchNumber !== undefined)
            product.batchNumber = batchNumber;
        if (expiryDate !== undefined)
            product.expiryDate = expiryDate ? new Date(expiryDate) : null;
        await product.save();
        await (0, audit_js_1.logActivity)(req, 'PRODUCT_UPDATED', 'Product', product._id.toString(), `Updated product: ${product.name} (SKU: ${product.sku}, Stock: ${product.stock})`);
        res.json({ success: true, message: 'Product updated successfully', data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
    }
});
// Admin/Owner: Add batch to product
router.post('/:id/batches', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const product = await Product_js_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const { batchNumber, quantity, expiryDate, manufacturingDate, notes } = req.body;
        if (!batchNumber || !quantity || !expiryDate) {
            res.status(400).json({ success: false, message: 'batchNumber, quantity, and expiryDate are required' });
            return;
        }
        const batch = await InventoryBatch_js_1.InventoryBatch.create({
            productId: product._id,
            batchNumber: String(batchNumber).trim(),
            quantity: Number(quantity),
            initialQuantity: Number(quantity),
            manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
            expiryDate: new Date(expiryDate),
            notes: notes || '',
        });
        // Increase product stock
        product.stock += Number(quantity);
        if (!product.expiryDate || new Date(expiryDate) < product.expiryDate) {
            product.expiryDate = new Date(expiryDate);
        }
        product.batchNumber = batch.batchNumber;
        await product.save();
        await (0, audit_js_1.logActivity)(req, 'BATCH_ADDED', 'Product', product._id.toString(), `Added batch ${batch.batchNumber} with ${quantity} units to ${product.name}`);
        res.status(201).json({ success: true, message: 'Batch added and stock updated', data: batch, product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add batch', error: error.message });
    }
});
// Admin/Owner: Deactivate / Delete product
router.delete('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const product = await Product_js_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        product.isActive = false;
        await product.save();
        await (0, audit_js_1.logActivity)(req, 'PRODUCT_DEACTIVATED', 'Product', product._id.toString(), `Deactivated product: ${product.name} (${product.sku})`);
        res.json({ success: true, message: 'Product deactivated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to deactivate product', error: error.message });
    }
});
exports.default = router;

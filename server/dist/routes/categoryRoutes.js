"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_js_1 = require("../models/Category.js");
const Product_js_1 = require("../models/Product.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// Public: List all active categories with product counts
router.get('/', async (_req, res) => {
    try {
        const categories = await Category_js_1.Category.find({ isActive: true }).sort({ name: 1 });
        // Calculate live product count for each category
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const count = await Product_js_1.Product.countDocuments({ category: cat.name, isActive: true });
            return {
                ...cat.toObject(),
                itemCount: count,
            };
        }));
        res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
    }
});
// Admin/Owner: Get all categories (including inactive)
router.get('/all', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (_req, res) => {
    try {
        const categories = await Category_js_1.Category.find().sort({ createdAt: -1 });
        res.json({ success: true, count: categories.length, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
    }
});
// Admin/Owner: Create new category
router.post('/', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { name, description, icon, image } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Category name is required' });
            return;
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const existing = await Category_js_1.Category.findOne({ slug });
        if (existing) {
            res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
            return;
        }
        const category = await Category_js_1.Category.create({
            name: name.trim(),
            slug,
            description: description || '',
            icon: icon || 'Pill',
            image: image || '',
            isActive: true,
        });
        await (0, audit_js_1.logActivity)(req, 'CATEGORY_CREATED', 'Category', category._id.toString(), `Created category: ${category.name}`);
        res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
});
// Admin/Owner: Update category
router.put('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const { name, description, icon, image, isActive } = req.body;
        const category = await Category_js_1.Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        if (name) {
            category.name = name.trim();
            category.slug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        if (description !== undefined)
            category.description = description;
        if (icon)
            category.icon = icon;
        if (image !== undefined)
            category.image = image;
        if (isActive !== undefined)
            category.isActive = isActive;
        await category.save();
        await (0, audit_js_1.logActivity)(req, 'CATEGORY_UPDATED', 'Category', category._id.toString(), `Updated category: ${category.name}`);
        res.json({ success: true, message: 'Category updated successfully', data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
});
// Admin/Owner: Toggle active/inactive
router.delete('/:id', auth_js_1.verifyAuth, (0, auth_js_1.requireRole)('admin', 'owner'), async (req, res) => {
    try {
        const category = await Category_js_1.Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        category.isActive = !category.isActive;
        await category.save();
        await (0, audit_js_1.logActivity)(req, 'CATEGORY_TOGGLED', 'Category', category._id.toString(), `Toggled category status to ${category.isActive ? 'active' : 'inactive'}: ${category.name}`);
        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle category', error: error.message });
    }
});
exports.default = router;

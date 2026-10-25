import { Router, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AuthenticatedRequest, verifyAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = Router();

// Public: List all active categories with product counts
router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // Calculate live product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name, isActive: true });
        return {
          ...cat.toObject(),
          itemCount: count,
        };
      })
    );

    res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

// Admin/Owner: Get all categories (including inactive)
router.get('/all', verifyAuth, requireRole('admin', 'owner'), async (_req, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

// Admin/Owner: Create new category
router.post('/', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
      return;
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
      icon: icon || 'Pill',
      image: image || '',
      isActive: true,
    });

    await logActivity(
      req,
      'CATEGORY_CREATED',
      'Category',
      (category._id as any).toString(),
      `Created category: ${category.name}`
    );

    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
});

// Admin/Owner: Update category
router.put('/:id', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);
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
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    await logActivity(
      req,
      'CATEGORY_UPDATED',
      'Category',
      (category._id as any).toString(),
      `Updated category: ${category.name}`
    );

    res.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
});

// Admin/Owner: Toggle active/inactive
router.delete('/:id', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    category.isActive = !category.isActive;
    await category.save();

    await logActivity(
      req,
      'CATEGORY_TOGGLED',
      'Category',
      (category._id as any).toString(),
      `Toggled category status to ${category.isActive ? 'active' : 'inactive'}: ${category.name}`
    );

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle category', error: error.message });
  }
});

export default router;


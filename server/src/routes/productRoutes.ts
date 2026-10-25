import { Router, Response } from 'express';
import { Product } from '../models/Product.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { AuthenticatedRequest, verifyAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = Router();

// Public / Organization: Get products catalog with filtering, search, and pagination
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      manufacturer,
      inStockOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const query: any = { isActive: true };

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

    const sortObj: any = {};
    if (sortBy === 'price_asc') sortObj.price = 1;
    else if (sortBy === 'price_desc') sortObj.price = -1;
    else if (sortBy === 'name_asc') sortObj.name = 1;
    else if (sortBy === 'stock_desc') sortObj.stock = -1;
    else sortObj[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(query),
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
});

// Admin/Owner: Inventory Alerts (Low stock and near-expiry / expired)
router.get('/inventory/alerts', verifyAuth, requireRole('admin', 'owner'), async (_req, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const ninetyDaysAhead = new Date();
    ninetyDaysAhead.setDate(now.getDate() + 90);

    // 1. Low stock products (stock <= lowStockThreshold)
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).sort({ stock: 1 });

    // 2. Near-expiry or expired products
    const expiringProducts = await Product.find({
      isActive: true,
      expiryDate: { $ne: null, $lte: ninetyDaysAhead },
    }).sort({ expiryDate: 1 });

    // 3. Batches near expiry
    const expiringBatches = await InventoryBatch.find({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory alerts', error: error.message });
  }
});

// Public / Organization: Get single product detail
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Also get active batches for this product
    const batches = await InventoryBatch.find({
      productId: product._id,
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      data: product,
      batches,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details', error: error.message });
  }
});

// Admin/Owner: Create new product
router.post('/', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      sku,
      category,
      categoryId,
      manufacturer,
      description,
      image,
      unit,
      price,
      stock,
      lowStockThreshold,
      prescriptionRequired,
      batchNumber,
      expiryDate,
    } = req.body;

    if (!name || !sku || !category || !manufacturer || price === undefined || stock === undefined) {
      res.status(400).json({ success: false, message: 'Please provide all required product fields' });
      return;
    }

    const existingSku = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existingSku) {
      res.status(400).json({ success: false, message: `A product with SKU ${sku.toUpperCase()} already exists` });
      return;
    }

    const product = await Product.create({
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
      await InventoryBatch.create({
        productId: product._id,
        batchNumber: product.batchNumber,
        quantity: Number(stock),
        initialQuantity: Number(stock),
        expiryDate: new Date(expiryDate),
        notes: 'Initial stock entry',
      });
    }

    await logActivity(
      req,
      'PRODUCT_CREATED',
      'Product',
      (product._id as any).toString(),
      `Created product: ${product.name} (SKU: ${product.sku}, Stock: ${product.stock})`
    );

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
});

// Admin/Owner: Update product
router.put('/:id', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const {
      name,
      sku,
      category,
      categoryId,
      manufacturer,
      description,
      image,
      unit,
      price,
      stock,
      lowStockThreshold,
      prescriptionRequired,
      isActive,
      batchNumber,
      expiryDate,
    } = req.body;

    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingSku) {
        res.status(400).json({ success: false, message: `SKU ${sku.toUpperCase()} is already in use by another product` });
        return;
      }
      product.sku = sku.toUpperCase().trim();
    }

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (manufacturer) product.manufacturer = manufacturer.trim();
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (unit) product.unit = unit;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (prescriptionRequired !== undefined) product.prescriptionRequired = Boolean(prescriptionRequired);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (batchNumber !== undefined) product.batchNumber = batchNumber;
    if (expiryDate !== undefined) product.expiryDate = expiryDate ? new Date(expiryDate) : null;

    await product.save();

    await logActivity(
      req,
      'PRODUCT_UPDATED',
      'Product',
      (product._id as any).toString(),
      `Updated product: ${product.name} (SKU: ${product.sku}, Stock: ${product.stock})`
    );

    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
});

// Admin/Owner: Add batch to product
router.post('/:id/batches', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const { batchNumber, quantity, expiryDate, manufacturingDate, notes } = req.body;
    if (!batchNumber || !quantity || !expiryDate) {
      res.status(400).json({ success: false, message: 'batchNumber, quantity, and expiryDate are required' });
      return;
    }

    const batch = await InventoryBatch.create({
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

    await logActivity(
      req,
      'BATCH_ADDED',
      'Product',
      (product._id as any).toString(),
      `Added batch ${batch.batchNumber} with ${quantity} units to ${product.name}`
    );

    res.status(201).json({ success: true, message: 'Batch added and stock updated', data: batch, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add batch', error: error.message });
  }
});

// Admin/Owner: Deactivate / Delete product
router.delete('/:id', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.isActive = false;
    await product.save();

    await logActivity(
      req,
      'PRODUCT_DEACTIVATED',
      'Product',
      (product._id as any).toString(),
      `Deactivated product: ${product.name} (${product.sku})`
    );

    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to deactivate product', error: error.message });
  }
});

export default router;


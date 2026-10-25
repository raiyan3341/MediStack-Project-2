import { Router, Response } from 'express';
import { ProductRequest } from '../models/ProductRequest.js';
import { Product } from '../models/Product.js';
import { Organization } from '../models/Organization.js';
import { Notification } from '../models/Notification.js';
import {
  AuthenticatedRequest,
  verifyAuth,
  requireRole,
  requireApprovedOrganization,
} from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = Router();

// Organization: Submit special product demand request
router.post('/', verifyAuth, requireApprovedOrganization, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const org = await Organization.findById(orgId);
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const { itemName, category, expectedQuantity, urgency, explanation } = req.body;
    if (!itemName || !expectedQuantity || !explanation) {
      res.status(400).json({ success: false, message: 'Item name, expected quantity, and explanation are required.' });
      return;
    }

    const productRequest = await ProductRequest.create({
      organizationId: org._id,
      organizationName: org.name,
      requestedByUserId: req.user?.id as any,
      itemName: itemName.trim(),
      category: category || 'General Medical Supply',
      expectedQuantity: Number(expectedQuantity),
      urgency: urgency || 'medium',
      explanation: explanation.trim(),
      status: 'pending',
    });

    // Notify admins
    await Notification.create({
      recipientRole: 'admin',
      title: 'New Product Demand Request',
      message: `${org.name} requested "${itemName}" (${expectedQuantity} units).`,
      type: 'product_request',
      link: '/admin/requests',
    });

    await logActivity(
      req,
      'PRODUCT_REQUEST_SUBMITTED',
      'Organization',
      (productRequest._id as any).toString(),
      `${org.name} requested item: ${itemName} (${expectedQuantity} units)`
    );

    res.status(201).json({
      success: true,
      message: 'Product demand request submitted. Platform administrators will review your request.',
      data: productRequest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit request', error: error.message });
  }
});

// Organization: Get own product requests
router.get('/my', verifyAuth, requireRole('organization'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const requests = await ProductRequest.find({ organizationId: orgId }).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch your requests', error: error.message });
  }
});

// Admin/Owner: Get all product requests with status filter
router.get('/', verifyAuth, requireRole('admin', 'owner'), async (req, res: Response): Promise<void> => {
  try {
    const { status, urgency } = req.query;
    const query: any = {};
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    const requests = await ProductRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
});

// Admin/Owner: Review request (approve, reject, mark under review, convert to catalog)
router.patch('/:id/review', verifyAuth, requireRole('admin', 'owner'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, adminResponse, createCatalogProduct, productDetails } = req.body;
    const productRequest = await ProductRequest.findById(req.params.id);

    if (!productRequest) {
      res.status(404).json({ success: false, message: 'Product request not found' });
      return;
    }

    productRequest.status = status;
    if (adminResponse !== undefined) productRequest.adminResponse = adminResponse;

    // Optional: convert approved request directly into a catalog item
    if (status === 'approved' && createCatalogProduct && productDetails) {
      const newProduct = await Product.create({
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

      productRequest.convertedProductId = newProduct._id as any;
      productRequest.status = 'fulfilled';

      await logActivity(
        req,
        'REQUEST_CONVERTED_TO_PRODUCT',
        'Product',
        (newProduct._id as any).toString(),
        `Converted demand request "${productRequest.itemName}" into catalog item: ${newProduct.name}`
      );
    }

    await productRequest.save();

    // Send notification to requesting organization
    await Notification.create({
      organizationId: productRequest.organizationId,
      recipientUserId: productRequest.requestedByUserId,
      title: `Product Request ${status.toUpperCase().replace('_', ' ')}`,
      message: `Your request for "${productRequest.itemName}" is now ${status.toUpperCase()}.${adminResponse ? ` Admin Response: ${adminResponse}` : ''}`,
      type: 'product_request',
      link: '/organization/requests',
    });

    await logActivity(
      req,
      'PRODUCT_REQUEST_REVIEWED',
      'Organization',
      (productRequest.organizationId as any).toString(),
      `Reviewed request for "${productRequest.itemName}" -> ${status}`
    );

    res.json({
      success: true,
      message: 'Product demand request reviewed successfully.',
      data: productRequest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update request', error: error.message });
  }
});

export default router;


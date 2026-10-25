import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';
import { Organization } from '../models/Organization.js';

export interface AuthUserPayload {
  id: string;
  firebaseUid?: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'medistock_secure_jwt_secret_key_2026_dev';

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authorization token missing or invalid format.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      
      // Check user existence and active status in MongoDB
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ success: false, message: 'User account no longer exists.' });
        return;
      }

      if (user.accountStatus === 'suspended') {
        res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
        return;
      }

      // Sync latest role and organizationId
      req.user = {
        id: (user._id as any).toString(),
        firebaseUid: user.firebaseUid || '',
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId ? (user.organizationId as any).toString() : null,
      };

      next();
    } catch (jwtErr) {
      res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
      return;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Authentication verification error', error: error.message });
  }
};

/**
 * RBAC middleware: ensures user has one of the required roles
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated. Please log in.' });
      return;
    }

    // Owner has super-privileges over admin, organization, and normal user routes
    if (req.user.role === 'owner') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${roles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};

/**
 * Ensures that if user is an organization, it is currently approved and not suspended
 */
export const requireApprovedOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    if (req.user.role === 'owner' || req.user.role === 'admin') {
      return next();
    }

    if (!req.user.organizationId) {
      res.status(403).json({
        success: false,
        message: 'No registered organization profile linked with this account. Please register your organization first.',
      });
      return;
    }

    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization record not found.' });
      return;
    }

    if (org.isSuspended) {
      res.status(403).json({
        success: false,
        message: 'Organization account is suspended. Please contact platform administration.',
      });
      return;
    }

    if (org.verificationStatus !== 'approved') {
      res.status(403).json({
        success: false,
        message: `Your organization is currently ${org.verificationStatus.toUpperCase()}. Supply ordering is only available after administrator approval.`,
        verificationStatus: org.verificationStatus,
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Organization verification check failed', error: error.message });
  }
};


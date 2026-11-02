"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApprovedOrganization = exports.requireRole = exports.verifyAuth = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const Organization_js_1 = require("../models/Organization.js");
const JWT_SECRET = process.env.JWT_SECRET || 'medistock_secure_jwt_secret_key_2026_dev';
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authorization token missing or invalid format.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        // Verify JWT
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Check user existence and active status in MongoDB
            const user = await User_js_1.User.findById(decoded.id);
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
                id: user._id.toString(),
                firebaseUid: user.firebaseUid || '',
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId ? user.organizationId.toString() : null,
            };
            next();
        }
        catch (jwtErr) {
            res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Authentication verification error', error: error.message });
    }
};
exports.verifyAuth = verifyAuth;
/**
 * RBAC middleware: ensures user has one of the required roles
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
/**
 * Ensures that if user is an organization, it is currently approved and not suspended
 */
const requireApprovedOrganization = async (req, res, next) => {
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
        const org = await Organization_js_1.Organization.findById(req.user.organizationId);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Organization verification check failed', error: error.message });
    }
};
exports.requireApprovedOrganization = requireApprovedOrganization;

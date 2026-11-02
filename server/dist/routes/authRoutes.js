"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = require("../models/User.js");
const Organization_js_1 = require("../models/Organization.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// Register with Email and Password
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
            return;
        }
        const existingUser = await User_js_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_js_1.User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            firebaseUid: `LOCAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            role: 'user',
            accountStatus: 'active',
        });
        await (0, audit_js_1.logActivity)(req, 'USER_REGISTERED', 'User', user._id.toString(), `New user registered: ${user.name} (${user.email})`);
        const token = (0, auth_js_1.generateToken)({
            id: user._id.toString(),
            firebaseUid: user.firebaseUid || '',
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: null,
        });
        res.status(201).json({
            success: true,
            message: 'Account registered successfully!',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: null,
            },
            organization: null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
});
// Login with Email and Password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide both email and password.' });
            return;
        }
        const user = await User_js_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        if (user.accountStatus === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact platform administration.' });
            return;
        }
        // Check password
        if (!user.password) {
            res.status(401).json({
                success: false,
                message: 'This account was created via Google Sign-In. Please sign in using Google.',
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        // Load organization if linked
        let organization = null;
        if (user.organizationId) {
            organization = await Organization_js_1.Organization.findById(user.organizationId);
        }
        else {
            organization = await Organization_js_1.Organization.findOne({ ownerUserId: user._id });
            if (organization) {
                user.organizationId = organization._id;
                user.role = 'organization';
                await user.save();
            }
        }
        const token = (0, auth_js_1.generateToken)({
            id: user._id.toString(),
            firebaseUid: user.firebaseUid || '',
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: organization ? organization._id.toString() : null,
        });
        res.json({
            success: true,
            message: 'Logged in successfully!',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role,
                organizationId: organization ? organization._id.toString() : null,
            },
            organization: organization
                ? {
                    id: organization._id.toString(),
                    name: organization.name,
                    type: organization.type,
                    verificationStatus: organization.verificationStatus,
                    rejectionReason: organization.rejectionReason,
                }
                : null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Login error', error: error.message });
    }
});
// Sync user from Firebase (Google Auth)
router.post('/sync-user', async (req, res) => {
    try {
        const { firebaseUid, email, name, profileImage } = req.body;
        if (!firebaseUid || !email) {
            res.status(400).json({ success: false, message: 'firebaseUid and email are required' });
            return;
        }
        let user = await User_js_1.User.findOne({ firebaseUid });
        if (!user) {
            // Check if user exists by email
            user = await User_js_1.User.findOne({ email: email.toLowerCase() });
            if (user) {
                user.firebaseUid = firebaseUid;
                if (profileImage && !user.profileImage)
                    user.profileImage = profileImage;
                await user.save();
            }
            else {
                // Create new user (default role is 'user')
                user = await User_js_1.User.create({
                    firebaseUid,
                    email: email.toLowerCase(),
                    name: name || email.split('@')[0],
                    profileImage: profileImage || '',
                    role: 'user',
                    accountStatus: 'active',
                });
                await (0, audit_js_1.logActivity)(req, 'USER_REGISTERED', 'User', user._id.toString(), `New user registered: ${user.name} (${user.email})`);
            }
        }
        if (user.accountStatus === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended.' });
            return;
        }
        // Find linked organization if user is an organization
        let organization = null;
        if (user.organizationId) {
            organization = await Organization_js_1.Organization.findById(user.organizationId);
        }
        else {
            organization = await Organization_js_1.Organization.findOne({ ownerUserId: user._id });
            if (organization) {
                user.organizationId = organization._id;
                user.role = 'organization';
                await user.save();
            }
        }
        const token = (0, auth_js_1.generateToken)({
            id: user._id.toString(),
            firebaseUid: user.firebaseUid || '',
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: organization ? organization._id.toString() : null,
        });
        res.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                firebaseUid: user.firebaseUid,
                email: user.email,
                name: user.name,
                profileImage: user.profileImage,
                role: user.role,
                organizationId: organization ? organization._id.toString() : null,
            },
            organization: organization
                ? {
                    id: organization._id.toString(),
                    name: organization.name,
                    type: organization.type,
                    verificationStatus: organization.verificationStatus,
                    rejectionReason: organization.rejectionReason,
                }
                : null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error syncing user', error: error.message });
    }
});
// Get current session user
router.get('/me', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const user = await User_js_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        let organization = null;
        if (user.organizationId) {
            organization = await Organization_js_1.Organization.findById(user.organizationId);
        }
        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                firebaseUid: user.firebaseUid,
                email: user.email,
                name: user.name,
                profileImage: user.profileImage,
                role: user.role,
                organizationId: organization ? organization._id.toString() : null,
            },
            organization: organization
                ? {
                    id: organization._id.toString(),
                    name: organization.name,
                    type: organization.type,
                    verificationStatus: organization.verificationStatus,
                    rejectionReason: organization.rejectionReason,
                    licenseNumber: organization.licenseNumber,
                    address: organization.address,
                    city: organization.city,
                    area: organization.area,
                    contactNumber: organization.contactNumber,
                    businessEmail: organization.businessEmail,
                }
                : null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve user', error: error.message });
    }
});
// Update personal profile
router.put('/profile', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { name, profileImage } = req.body;
        const user = await User_js_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (name)
            user.name = name;
        if (profileImage !== undefined)
            user.profileImage = profileImage;
        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
});
exports.default = router;

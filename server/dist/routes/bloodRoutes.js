"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DonorProfile_js_1 = require("../models/DonorProfile.js");
const BloodRequest_js_1 = require("../models/BloodRequest.js");
const Notification_js_1 = require("../models/Notification.js");
const auth_js_1 = require("../middleware/auth.js");
const audit_js_1 = require("../middleware/audit.js");
const router = (0, express_1.Router)();
// ==================== DONOR PROFILES ====================
// Public: Search blood donors with filters
router.get('/donors', async (req, res) => {
    try {
        const { bloodGroup, city, area, availableOnly = 'true' } = req.query;
        const query = { consentGiven: true };
        if (bloodGroup && bloodGroup !== 'All') {
            query.bloodGroup = bloodGroup;
        }
        if (city && city !== 'All') {
            query.city = { $regex: String(city).trim(), $options: 'i' };
        }
        if (area) {
            query.area = { $regex: String(area).trim(), $options: 'i' };
        }
        if (availableOnly === 'true') {
            query.isAvailable = true;
        }
        const donors = await DonorProfile_js_1.DonorProfile.find(query).sort({ updatedAt: -1 }).limit(50);
        // Apply privacy masking if required, e.g. partially hide telephone number
        const safeDonors = donors.map((d) => {
            const obj = d.toObject();
            return {
                _id: obj._id,
                fullName: obj.fullName,
                bloodGroup: obj.bloodGroup,
                city: obj.city,
                area: obj.area,
                contactNumber: obj.contactNumber,
                contactPreference: obj.contactPreference,
                lastDonationDate: obj.lastDonationDate,
                isAvailable: obj.isAvailable,
                totalDonationsCount: obj.totalDonationsCount,
                notes: obj.notes,
            };
        });
        res.json({
            success: true,
            count: safeDonors.length,
            data: safeDonors,
            disclaimer: 'Notice: MediStock connects potential voluntary blood donors and recipients. It does not provide medical testing, transfusion, or blood matching services. Qualified healthcare professionals must screen all donations.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to search donors', error: error.message });
    }
});
// Authenticated: Get own donor profile
router.get('/donors/me', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const profile = await DonorProfile_js_1.DonorProfile.findOne({ userId: req.user?.id });
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch donor profile', error: error.message });
    }
});
// Authenticated: Register or update blood donor profile
router.post('/donors', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { fullName, bloodGroup, city, area, contactNumber, contactEmail, contactPreference, lastDonationDate, isAvailable, consentGiven, notes, } = req.body;
        if (!fullName || !bloodGroup || !city || !area || !contactNumber) {
            res.status(400).json({ success: false, message: 'Please provide all required donor profile fields.' });
            return;
        }
        let profile = await DonorProfile_js_1.DonorProfile.findOne({ userId: req.user?.id });
        if (profile) {
            profile.fullName = fullName.trim();
            profile.bloodGroup = bloodGroup;
            profile.city = city.trim();
            profile.area = area.trim();
            profile.contactNumber = contactNumber.trim();
            if (contactEmail !== undefined)
                profile.contactEmail = contactEmail;
            if (contactPreference)
                profile.contactPreference = contactPreference;
            if (lastDonationDate !== undefined)
                profile.lastDonationDate = lastDonationDate ? new Date(lastDonationDate) : undefined;
            if (isAvailable !== undefined)
                profile.isAvailable = Boolean(isAvailable);
            if (consentGiven !== undefined)
                profile.consentGiven = Boolean(consentGiven);
            if (notes !== undefined)
                profile.notes = notes;
            await profile.save();
        }
        else {
            profile = await DonorProfile_js_1.DonorProfile.create({
                userId: req.user?.id,
                fullName: fullName.trim(),
                bloodGroup: bloodGroup,
                city: city.trim(),
                area: area.trim(),
                contactNumber: contactNumber.trim(),
                contactEmail: contactEmail || req.user?.email || '',
                contactPreference: contactPreference || 'call',
                lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
                consentGiven: consentGiven !== undefined ? Boolean(consentGiven) : true,
                notes: notes || '',
            });
        }
        await (0, audit_js_1.logActivity)(req, 'DONOR_PROFILE_UPDATED', 'User', profile._id.toString(), `Blood donor profile registered/updated for ${profile.fullName} (${profile.bloodGroup})`);
        res.json({
            success: true,
            message: 'Blood donor profile saved successfully!',
            data: profile,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save donor profile', error: error.message });
    }
});
// ==================== BLOOD REQUESTS ====================
// Public: Get all active blood requests
router.get('/requests', async (req, res) => {
    try {
        const { bloodGroup, city, urgency, status = 'open' } = req.query;
        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (bloodGroup && bloodGroup !== 'All') {
            query.bloodGroup = bloodGroup;
        }
        if (city && city !== 'All') {
            query.city = { $regex: String(city).trim(), $options: 'i' };
        }
        if (urgency && urgency !== 'All') {
            query.urgency = urgency;
        }
        const requests = await BloodRequest_js_1.BloodRequest.find(query).sort({ requiredDate: 1, createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch blood requests', error: error.message });
    }
});
// Authenticated: Get blood requests created by logged in user
router.get('/requests/my', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const requests = await BloodRequest_js_1.BloodRequest.find({ requesterUserId: req.user?.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your requests', error: error.message });
    }
});
// Authenticated: Create blood request
router.post('/requests', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { patientName, bloodGroup, unitsNeeded, hospitalName, city, area, contactNumber, requiredDate, urgency, reasonNotes, } = req.body;
        if (!patientName || !bloodGroup || !hospitalName || !city || !contactNumber || !requiredDate) {
            res.status(400).json({ success: false, message: 'Please provide all required blood request fields.' });
            return;
        }
        const bloodReq = await BloodRequest_js_1.BloodRequest.create({
            requesterUserId: req.user?.id,
            requesterName: req.user?.name || 'Anonymous User',
            patientName: patientName.trim(),
            bloodGroup,
            unitsNeeded: Number(unitsNeeded) || 1,
            hospitalName: hospitalName.trim(),
            city: city.trim(),
            area: area ? area.trim() : '',
            contactNumber: contactNumber.trim(),
            requiredDate: new Date(requiredDate),
            urgency: urgency || 'urgent',
            reasonNotes: reasonNotes || '',
            status: 'open',
            responses: [],
        });
        await (0, audit_js_1.logActivity)(req, 'BLOOD_REQUEST_CREATED', 'BloodRequest', bloodReq._id.toString(), `Created blood request for ${patientName} (${bloodGroup}, ${unitsNeeded} units) at ${hospitalName}`);
        res.status(201).json({
            success: true,
            message: 'Blood request posted successfully. Voluntary donors will be able to see it.',
            data: bloodReq,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create blood request', error: error.message });
    }
});
// Authenticated: Respond to a blood request
router.post('/requests/:id/respond', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { donorPhone, message } = req.body;
        const bloodReq = await BloodRequest_js_1.BloodRequest.findById(req.params.id);
        if (!bloodReq) {
            res.status(404).json({ success: false, message: 'Blood request not found.' });
            return;
        }
        if (bloodReq.status !== 'open') {
            res.status(400).json({ success: false, message: 'This blood request is no longer open.' });
            return;
        }
        // Add response
        bloodReq.responses.push({
            donorUserId: req.user?.id,
            donorName: req.user?.name || 'Voluntary Donor',
            donorPhone: donorPhone || 'Available upon request',
            message: message || 'I am willing to donate blood.',
            status: 'offered',
            createdAt: new Date(),
        });
        await bloodReq.save();
        // Notify requester
        await Notification_js_1.Notification.create({
            recipientUserId: bloodReq.requesterUserId,
            title: 'Donor Responded to Blood Request',
            message: `${req.user?.name} offered to donate blood for patient ${bloodReq.patientName} (${bloodReq.bloodGroup}).`,
            type: 'blood_request',
            link: '/blood-donation',
        });
        res.json({
            success: true,
            message: 'Thank you! Your donation response has been recorded and the patient family has been notified.',
            data: bloodReq,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit response', error: error.message });
    }
});
// Authenticated: Mark request as fulfilled or cancelled
router.patch('/requests/:id/status', auth_js_1.verifyAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const bloodReq = await BloodRequest_js_1.BloodRequest.findById(req.params.id);
        if (!bloodReq) {
            res.status(404).json({ success: false, message: 'Blood request not found' });
            return;
        }
        // Must be requester or admin/owner
        const isOwnerOrAdmin = req.user?.role === 'admin' || req.user?.role === 'owner';
        const isRequester = bloodReq.requesterUserId.toString() === req.user?.id?.toString();
        if (!isRequester && !isOwnerOrAdmin) {
            res.status(403).json({ success: false, message: 'Only the request creator or admin can update this status.' });
            return;
        }
        bloodReq.status = status;
        await bloodReq.save();
        res.json({
            success: true,
            message: `Blood request status updated to ${status}.`,
            data: bloodReq,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update request status', error: error.message });
    }
});
exports.default = router;

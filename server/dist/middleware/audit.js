"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const ActivityLog_js_1 = require("../models/ActivityLog.js");
const logActivity = async (req, action, entityType, entityId, description, details = {}) => {
    try {
        const actorUserId = req.user?.id ? req.user.id : null;
        const actorName = req.user?.name || 'System / Guest';
        const actorRole = req.user?.role || 'system';
        await ActivityLog_js_1.ActivityLog.create({
            actorUserId,
            actorName,
            actorRole,
            action,
            entityType,
            entityId,
            description,
            details,
        });
    }
    catch (error) {
        console.error('[Audit Logger Error]', error.message);
    }
};
exports.logActivity = logActivity;

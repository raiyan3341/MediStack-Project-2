"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BloodDonorResponseSchema = new mongoose_1.Schema({
    donorUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
        type: String,
        enum: ['offered', 'accepted', 'declined'],
        default: 'offered',
    },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const BloodRequestSchema = new mongoose_1.Schema({
    requesterUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    requesterName: { type: String, required: true },
    patientName: { type: String, required: true },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true,
        index: true,
    },
    unitsNeeded: { type: Number, required: true, min: 1, default: 1 },
    hospitalName: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true },
    contactNumber: { type: String, required: true },
    requiredDate: { type: Date, required: true },
    urgency: {
        type: String,
        enum: ['normal', 'urgent', 'critical'],
        default: 'urgent',
    },
    reasonNotes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['open', 'fulfilled', 'cancelled'],
        default: 'open',
        index: true,
    },
    responses: [BloodDonorResponseSchema],
}, { timestamps: true });
exports.BloodRequest = mongoose_1.default.model('BloodRequest', BloodRequestSchema);

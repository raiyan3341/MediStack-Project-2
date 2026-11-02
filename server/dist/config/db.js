"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Disable Mongoose command buffering in serverless to prevent request hanging/timeout
mongoose_1.default.set('bufferCommands', false);
let cachedPromise = null;
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        return true;
    }
    const mongoUri = process.env.MONGODB_URI ||
        'mongodb+srv://Medistack33:lqO7XGHxRLsVA55G@cluster0.dddbozq.mongodb.net/medistock?retryWrites=true&w=majority';
    if (!cachedPromise) {
        cachedPromise = mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000,
        });
    }
    try {
        await cachedPromise;
        console.log(`[Database] MongoDB Connected: ${mongoose_1.default.connection.host}/${mongoose_1.default.connection.name}`);
        return true;
    }
    catch (error) {
        cachedPromise = null;
        console.warn(`[Database Warning] Could not connect to MongoDB: ${error.message}`);
        return false;
    }
};
exports.connectDB = connectDB;

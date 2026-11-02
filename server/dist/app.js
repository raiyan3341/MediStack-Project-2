"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const categoryRoutes_js_1 = __importDefault(require("./routes/categoryRoutes.js"));
const productRoutes_js_1 = __importDefault(require("./routes/productRoutes.js"));
const organizationRoutes_js_1 = __importDefault(require("./routes/organizationRoutes.js"));
const orderRoutes_js_1 = __importDefault(require("./routes/orderRoutes.js"));
const requestRoutes_js_1 = __importDefault(require("./routes/requestRoutes.js"));
const bloodRoutes_js_1 = __importDefault(require("./routes/bloodRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const db_js_1 = require("./config/db.js");
const createApp = () => {
    const app = (0, express_1.default)();
    // Middleware
    const configuredOrigins = (process.env.CLIENT_URL || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);
    const allowedOrigins = [
        'https://medistack2.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        ...configuredOrigins,
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl / same-origin)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) ||
                origin.endsWith('.vercel.app') ||
                origin.includes('localhost')) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request logger in development
    app.use((req, _res, next) => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(`[API] ${req.method} ${req.url}`);
        }
        next();
    });
    // Ensure database is connected on requests
    app.use(async (_req, _res, next) => {
        try {
            await (0, db_js_1.connectDB)();
        }
        catch (e) {
            // handled
        }
        next();
    });
    // Health check
    const healthHandler = (_req, res) => {
        res.json({
            status: 'healthy',
            service: 'MediStock Healthcare Supply Management API',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    };
    app.get('/api/health', healthHandler);
    app.get('/health', healthHandler);
    // Mount API Routes (support both /api/path and direct /path for Vercel rewrites)
    const mountRoutes = (prefix) => {
        app.use(`${prefix}/auth`, authRoutes_js_1.default);
        app.use(`${prefix}/categories`, categoryRoutes_js_1.default);
        app.use(`${prefix}/products`, productRoutes_js_1.default);
        app.use(`${prefix}/organizations`, organizationRoutes_js_1.default);
        app.use(`${prefix}/orders`, orderRoutes_js_1.default);
        app.use(`${prefix}/requests`, requestRoutes_js_1.default);
        app.use(`${prefix}/blood`, bloodRoutes_js_1.default);
        app.use(`${prefix}/admin`, adminRoutes_js_1.default);
        app.use(`${prefix}/notifications`, notificationRoutes_js_1.default);
    };
    mountRoutes('/api');
    mountRoutes('');
    // 404 Handler
    app.use((_req, res) => {
        res.status(404).json({ success: false, message: 'Resource or API route not found.' });
    });
    return app;
};
exports.createApp = createApp;
const app = (0, exports.createApp)();
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
    // @ts-ignore
    module.exports = app;
    // @ts-ignore
    module.exports.default = app;
}
exports.default = app;

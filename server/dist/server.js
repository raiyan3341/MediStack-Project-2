"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_js_1 = __importDefault(require("./app.js"));
const db_js_1 = require("./config/db.js");
const PORT = process.env.PORT || 5000;
const isServerless = process.env.VERCEL === '1' ||
    !!process.env.VERCEL ||
    !!process.env.VERCEL_ENV ||
    !!process.env.VERCEL_REGION ||
    !!process.env.NOW_REGION ||
    process.env.NODE_ENV === 'production';
// Only listen on port when running locally in development
if (!isServerless) {
    (0, db_js_1.connectDB)().then(() => {
        app_js_1.default.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(` MediStock Server Running on http://localhost:${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(` Health Check: http://localhost:${PORT}/api/health`);
            console.log(`====================================================`);
        });
    }).catch((err) => {
        console.error('Fatal Server Boot Error:', err);
    });
}
exports.default = app_js_1.default;
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
    // @ts-ignore
    module.exports = app_js_1.default;
    // @ts-ignore
    module.exports.default = app_js_1.default;
}

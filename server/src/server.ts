import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const isServerless =
  process.env.VERCEL === '1' ||
  !!process.env.VERCEL ||
  !!process.env.VERCEL_ENV ||
  !!process.env.VERCEL_REGION ||
  !!process.env.NOW_REGION;

// Only listen on port when running locally in development
if (!isServerless) {
  connectDB().then(() => {
    app.listen(PORT, () => {
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

export default app;

// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = app;
  // @ts-ignore
  module.exports.default = app;
}


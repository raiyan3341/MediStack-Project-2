import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` MediStock Server Running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});


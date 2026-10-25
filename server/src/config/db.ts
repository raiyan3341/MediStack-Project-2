import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medistock';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medistock'}`);
    console.warn(`[Database Warning] Reason: ${error.message}`);
    console.warn(`[Database Warning] Please ensure MongoDB is running locally or specify a valid MONGODB_URI in server/.env (e.g. MongoDB Atlas).`);
  }
};


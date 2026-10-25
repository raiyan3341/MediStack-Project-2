import mongoose from 'mongoose';

let isConnecting = false;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://Medistack33:lqO7XGHxRLsVA55G@cluster0.dddbozq.mongodb.net/medistock?retryWrites=true&w=majority';

  try {
    isConnecting = true;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnecting = false;
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error: any) {
    isConnecting = false;
    console.warn(`[Database Warning] Could not connect to MongoDB: ${error.message}`);
    return false;
  }
};


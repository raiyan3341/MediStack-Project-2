import mongoose from 'mongoose';

// Disable Mongoose command buffering in serverless to prevent request hanging/timeout
mongoose.set('bufferCommands', false);

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://Medistack33:lqO7XGHxRLsVA55G@cluster0.dddbozq.mongodb.net/medistock?retryWrites=true&w=majority';

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
  }

  try {
    await cachedPromise;
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error: any) {
    cachedPromise = null;
    console.warn(`[Database Warning] Could not connect to MongoDB: ${error.message}`);
    return false;
  }
};


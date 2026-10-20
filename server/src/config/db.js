import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas (or local fallback) via Mongoose ODM
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables (.env).');
    console.error('👉 Please configure your MongoDB Atlas connection string in server/.env');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

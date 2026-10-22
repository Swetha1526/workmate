import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not set in environment variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB (${conn.connection.name})`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return false;
  }
};

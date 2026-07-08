import mongoose from 'mongoose';

/**
 * Connect to MongoDB WITHOUT ever killing the process.
 * - Never calls process.exit(): a DB failure must not take down the HTTP server.
 * - Retries in the background with capped backoff.
 * - Emits lifecycle logs so connection issues are visible in production logs.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined. HTTP server stays up, but database features will fail.');
    return;
  }

  mongoose.set('strictQuery', true);

  // Lifecycle logging (registered once)
  mongoose.connection.on('error', (err) => console.error(`❌ MongoDB error: ${err.message}`));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

  const connectWithRetry = async (attempt = 1) => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      const delayMs = Math.min(30000, attempt * 5000);
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);
      console.log(`↻ Retrying MongoDB connection in ${delayMs / 1000}s...`);
      // Background retry — never blocks or exits the process.
      setTimeout(() => connectWithRetry(attempt + 1), delayMs);
    }
  };

  await connectWithRetry();
};

export default connectDB;

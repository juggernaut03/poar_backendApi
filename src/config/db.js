import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  // eslint-disable-next-line no-console
  console.log('[db] Connected to MongoDB');
  return mongoose.connection;
}

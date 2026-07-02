import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Court from '../models/Court.js';
import { buildCourts } from './courts.data.js';

const run = async () => {
  await connectDB();
  const courts = buildCourts();
  console.log(`🌱 Upserting ${courts.length} courts...`);

  // Upsert by (name + governorate) so re-running won't create duplicates
  // and won't wipe courts you added manually from the dashboard.
  const ops = courts.map((c) => ({
    updateOne: {
      filter: { name: c.name, governorate: c.governorate },
      update: { $set: c },
      upsert: true,
    },
  }));

  const res = await Court.bulkWrite(ops);
  const total = await Court.countDocuments();
  console.log(`✅ Done. Inserted: ${res.upsertedCount}, Updated: ${res.modifiedCount}. Total courts now: ${total}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error('Seed courts error:', e);
  process.exit(1);
});

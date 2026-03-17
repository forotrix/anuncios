import mongoose from 'mongoose';
import { User } from '../apps/api/src/models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function checkAdmins() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const admins = await User.find({ role: 'admin' }, 'email role');
  console.log('Admins found:', admins);
  await mongoose.disconnect();
}

checkAdmins();

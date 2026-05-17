import mongoose from 'mongoose';
import User from '@/models/User';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('Please define MONGO_URI in .env.local');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null, superAdminChecked: false };

const SUPER_ADMIN_EMAIL = 'superadmin@kiot.ac.in';
const SUPER_ADMIN_PASSWORD = 'superkiot@321';

async function ensureSuperAdminExists() {
  // Only run this check once per server lifecycle to avoid a DB query on every request
  if (cached.superAdminChecked) return;
  cached.superAdminChecked = true;

  try {
    const existingSuperAdmin = await User.findOne({ role: 'super-admin' });
    if (existingSuperAdmin) return;

    const existingDefaultEmail = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (existingDefaultEmail) {
      console.warn(
        `User with email ${SUPER_ADMIN_EMAIL} already exists but is not a super-admin. ` +
        'Please update that account manually or remove it to allow default super-admin creation.'
      );
      return;
    }

    await User.create({
      name: 'Super Admin',
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: 'super-admin',
      assignedServices: ['halls', 'vehicles', 'rooms'],
      status: 'active'
    });
    console.log(`Created default super-admin: ${SUPER_ADMIN_EMAIL}`);
  } catch (err) {
    // Don't block the app if super-admin check fails
    console.error('Super-admin check failed:', err.message);
  }
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  // Run super-admin check only once after first connection
  ensureSuperAdminExists();
  return cached.conn;
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  await connectDB();
  const u = await User.findById(user.id).select('-password');
  return NextResponse.json(u);
}

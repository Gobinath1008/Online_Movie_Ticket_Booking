import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Hall from '@/models/Hall';
import { requireAuth } from '@/lib/middleware';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  await connectDB();
  const bookings = await Booking.find({ user: user.id })
    .populate('user', 'name email department role')
    .populate('hall', 'name location capacity')
    .sort({ date: -1, startTime: -1 });
  return NextResponse.json(bookings);
}

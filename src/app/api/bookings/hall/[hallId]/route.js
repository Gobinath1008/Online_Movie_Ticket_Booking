import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import { requireAuth } from '@/lib/middleware';

// Hall bookings (for viewing schedule)
export async function GET(request, props) {
  const params = await props.params;
  await connectDB();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  let query = { hall: params.hallId, status: 'approved' };
  if (date) query.date = date;
  const bookings = await Booking.find(query)
    .populate('user', 'name email department')
    .sort({ date: 1, startTime: 1 });
  return NextResponse.json(bookings);
}

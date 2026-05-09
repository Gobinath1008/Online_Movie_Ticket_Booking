import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Hall from '@/models/Hall';
import { requireAuth, requireAdmin } from '@/lib/middleware';

const hasOverlap = (es, ee, ns, ne) => ns < ee && ne > es;

export async function GET(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  let query = {};
  if (status) query.status = status;
  if (date) query.date = date;
  const bookings = await Booking.find(query)
    .populate('user', 'name email department role')
    .populate('hall', 'name location capacity')
    .sort({ createdAt: -1 });
  return NextResponse.json(bookings);
}

export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  await connectDB();
  const { hall, date, startTime, endTime, purpose, attendees } = await request.json();

  if (!hall || !date || !startTime || !endTime || !purpose)
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  if (startTime >= endTime)
    return NextResponse.json({ message: 'Start time must be before end time' }, { status: 400 });

  // Conflict detection - approved bookings
  const approved = await Booking.find({ hall, date, status: 'approved' });
  for (const b of approved) {
    if (hasOverlap(b.startTime, b.endTime, startTime, endTime)) {
      return NextResponse.json({
        message: `Hall already booked from ${b.startTime} to ${b.endTime} on ${date}`
      }, { status: 409 });
    }
  }

  // Conflict detection - pending bookings
  const pending = await Booking.find({ hall, date, status: 'pending' });
  for (const b of pending) {
    if (hasOverlap(b.startTime, b.endTime, startTime, endTime)) {
      return NextResponse.json({ message: 'A pending booking exists for this time slot' }, { status: 409 });
    }
  }

  const booking = await Booking.create({
    user: user.id, hall, date, startTime, endTime, purpose, attendees: attendees || 1,
  });
  const populated = await booking.populate(['user', 'hall']);
  return NextResponse.json(populated, { status: 201 });
}

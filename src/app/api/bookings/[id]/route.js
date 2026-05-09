import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Hall from '@/models/Hall';
import { requireAuth, requireAdmin } from '@/lib/middleware';

const hasOverlap = (es, ee, ns, ne) => ns < ee && ne > es;

export async function PUT(request, props) {
  const params = await props.params;
  const { error } = await requireAdmin(request);
  if (error) return error;
  await connectDB();
  const { status, adminNote } = await request.json();
  if (!['approved', 'rejected'].includes(status))
    return NextResponse.json({ message: 'Status must be approved or rejected' }, { status: 400 });

  const booking = await Booking.findById(params.id).populate('hall');
  if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 });

  // Re-check overlaps before approving
  if (status === 'approved') {
    const existing = await Booking.find({ hall: booking.hall._id, date: booking.date, status: 'approved', _id: { $ne: booking._id } });
    for (const b of existing) {
      if (hasOverlap(b.startTime, b.endTime, booking.startTime, booking.endTime)) {
        return NextResponse.json({ message: `Conflicts with existing booking ${b.startTime}–${b.endTime}` }, { status: 409 });
      }
    }
  }

  booking.status = status;
  booking.adminNote = adminNote || '';
  await booking.save();
  return NextResponse.json(booking);
}

// User: cancel own pending/approved booking before it starts
export async function DELETE(request, props) {
  const params = await props.params;
  const { user, error } = await requireAuth(request);
  if (error) return error;
  await connectDB();
  const { reason } = await request.json() || {};
  const booking = await Booking.findById(params.id).populate('user', 'name email').populate('hall', 'name');
  if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
  if (booking.user._id.toString() !== user.id) return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  
  if (!['pending', 'approved'].includes(booking.status)) {
    return NextResponse.json({ message: 'Only pending or approved bookings can be cancelled' }, { status: 400 });
  }

  // Check if booking has already started
  const now = new Date();
  const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
  if (now > bookingStart) {
    return NextResponse.json({ message: 'Cannot cancel a booking that has already started or passed' }, { status: 400 });
  }

  booking.status = 'cancelled';
  booking.cancelledBy = 'user';
  booking.cancellationReason = reason || 'User cancelled';
  booking.cancelledAt = new Date();
  await booking.save();
  return NextResponse.json({ message: 'Booking cancelled', booking });
}

// Admin: cancel any booking with reason
export async function PATCH(request, props) {
  const params = await props.params;
  const { error } = await requireAdmin(request);
  if (error) return error;
  await connectDB();
  const { action, reason } = await request.json();

  if (action === 'cancel') {
    const booking = await Booking.findById(params.id).populate('user', 'name email').populate('hall', 'name');
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    if (booking.status === 'cancelled') {
      return NextResponse.json({ message: 'Booking is already cancelled' }, { status: 400 });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.cancellationReason = reason || 'Admin cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    return NextResponse.json({ message: 'Booking cancelled by admin', booking });
  }

  return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
}

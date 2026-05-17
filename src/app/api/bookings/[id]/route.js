import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import HallBooking from '@/models/HallBooking';
import VehicleBooking from '@/models/VehicleBooking';
import RoomBooking from '@/models/RoomBooking';
import { requireAuth, requireAdmin } from '@/lib/middleware';

const findBookingById = async (id) => {
  let booking = await HallBooking.findById(id).populate('user', 'name email phone');
  if (booking) return booking;
  booking = await VehicleBooking.findById(id).populate('user', 'name email phone');
  if (booking) return booking;
  booking = await RoomBooking.findById(id).populate('user', 'name email phone');
  return booking;
};

export async function GET(request, props) {
  const params = await props.params;
  const { user, error } = await requireAuth(request);
  if (error) return error;

  await connectDB();
  const booking = await findBookingById(params.id);
  
  if (!booking) {
    return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
  }

  // Check authorization
  if ((user.role === 'user' || user.role === 'customer') && booking.user._id.toString() !== user.id) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function PUT(request, props) {
  const params = await props.params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  await connectDB();
  const { status, adminNote } = await request.json();
  
  if (!['approved', 'rejected', 'completed'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const booking = await findBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
  }

  booking.status = status;
  booking.adminNote = adminNote || '';
  booking.actionBy = user.id; // Store admin who took action
  booking.actionAt = new Date();
  await booking.save();
  
  return NextResponse.json(booking);
}

// User: cancel own booking
export async function DELETE(request, props) {
  const params = await props.params;
  const { user, error } = await requireAuth(request);
  if (error) return error;

  await connectDB();
  const { reason } = await request.json() || {};
  const booking = await findBookingById(params.id);
  
  if (!booking) {
    return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
  }

  if (booking.user._id.toString() !== user.id && (user.role === 'user' || user.role === 'customer')) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }

  if (!['pending', 'approved'].includes(booking.status)) {
    return NextResponse.json({ message: 'Only pending or approved bookings can be cancelled' }, { status: 400 });
  }

  // Check if booking has already started
  const now = new Date();
  let bookingStart;
  
  if (booking.serviceType === 'hall') {
    bookingStart = new Date(`${booking.hallDate}T${booking.hallStartTime}`);
  } else if (booking.serviceType === 'vehicle') {
    bookingStart = new Date(booking.vehiclePickupDate);
  } else if (booking.serviceType === 'room') {
    bookingStart = new Date(booking.roomCheckInDate);
  }

  if (now > bookingStart) {
    return NextResponse.json({ message: 'Cannot cancel a booking that has already started' }, { status: 400 });
  }

  booking.status = 'cancelled';
  booking.cancelledBy = 'user';
  booking.cancellationReason = reason || 'User cancelled';
  booking.cancelledAt = new Date();
  await booking.save();
  
  return NextResponse.json({ message: 'Booking cancelled', booking });
}

// Admin: cancel or update booking
export async function PATCH(request, props) {
  const params = await props.params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  await connectDB();
  const { action, reason, status } = await request.json();
  const booking = await findBookingById(params.id);
  
  if (!booking) {
    return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
  }

  if (action === 'cancel') {
    if (booking.status === 'cancelled') {
      return NextResponse.json({ message: 'Booking is already cancelled' }, { status: 400 });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.actionBy = user.id; // Store admin who cancelled
    booking.cancellationReason = reason || 'Admin cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
    return NextResponse.json({ message: 'Booking cancelled by admin', booking });
  }

  if (action === 'update-status' && status) {
    booking.status = status;
    booking.actionBy = user.id;
    booking.actionAt = new Date();
    await booking.save();
    return NextResponse.json(booking);
  }

  return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
}

import mongoose from 'mongoose';

const RoomBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, default: 'room' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuestRoom', required: true },
  
  roomCheckInDate: { type: String, required: true },
  roomCheckOutDate: { type: String, required: true },
  roomCheckInTime: { type: String, default: '14:00' },
  roomCheckOutTime: { type: String, default: '12:00' },
  numberOfGuests: Number,
  numberOfRooms: { type: Number, default: 1 },
  specialRequests: String,

  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  totalAmount: { type: Number, required: true },
  guestName: String,
  guestEmail: String,
  guestPhone: String,

  adminNote: String,
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionAt: Date,
  cancelledBy: { type: String, enum: ['user', 'admin'], default: null },
  cancellationReason: String,
  cancelledAt: Date,

  paymentId: String,
  paymentMethod: { type: String, default: 'razorpay' },
  invoice: String,

  department: String,
}, { timestamps: true });

RoomBookingSchema.index({ user: 1, createdAt: -1 });
RoomBookingSchema.index({ serviceId: 1, status: 1 });
RoomBookingSchema.index({ serviceId: 1, roomCheckInDate: 1 });

// Safe Mongoose hot-reloading
if (mongoose.models.RoomBooking) {
  delete mongoose.models.RoomBooking;
}

export default mongoose.model('RoomBooking', RoomBookingSchema);

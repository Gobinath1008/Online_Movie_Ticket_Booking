import mongoose from 'mongoose';

const HallBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, default: 'hall' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  
  hallDate: { type: String, required: true },
  hallStartTime: { type: String, required: true },
  hallEndTime: { type: String, required: true },
  purpose: { type: String, required: true },
  attendees: Number,

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
  timeSlotType: { type: String, enum: ['hourly', 'custom', 'full-day'], default: 'hourly' },
  recurringBooking: {
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: String
  },
  blockedDate: { type: Boolean, default: false },
  blockedReason: { type: String },
  overrideBooking: { type: Boolean, default: false },
}, { timestamps: true });

HallBookingSchema.index({ user: 1, createdAt: -1 });
HallBookingSchema.index({ serviceId: 1, status: 1 });
HallBookingSchema.index({ serviceId: 1, hallDate: 1 });

// Safe Mongoose hot-reloading
if (mongoose.models.HallBooking) {
  delete mongoose.models.HallBooking;
}

export default mongoose.model('HallBooking', HallBookingSchema);

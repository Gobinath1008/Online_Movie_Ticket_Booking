import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String, required: true, trim: true },
  attendees: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  adminNote: { type: String, default: '' },
  cancelledBy: { type: String, enum: ['user', 'admin'], default: null },
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

BookingSchema.index({ hall: 1, date: 1, status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

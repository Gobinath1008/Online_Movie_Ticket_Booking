import mongoose from 'mongoose';

const VehicleBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, default: 'vehicle' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  
  vehiclePickupDate: { type: String, required: true },
  vehicleReturnDate: { type: String, required: true },
  vehiclePickupTime: String,
  vehicleReturnTime: String,
  pickupLocation: String,
  returnLocation: String,
  withDriver: { type: Boolean, default: false },
  fuelOption: { type: String, enum: ['empty', 'full'], default: 'empty' },
  mileage: Number,

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

VehicleBookingSchema.index({ user: 1, createdAt: -1 });
VehicleBookingSchema.index({ serviceId: 1, status: 1 });
VehicleBookingSchema.index({ serviceId: 1, vehiclePickupDate: 1 });

// Safe Mongoose hot-reloading
if (mongoose.models.VehicleBooking) {
  delete mongoose.models.VehicleBooking;
}

export default mongoose.model('VehicleBooking', VehicleBookingSchema);

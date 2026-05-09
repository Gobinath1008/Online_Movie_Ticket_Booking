import mongoose from 'mongoose';

const HallSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true },
  facilities: { type: [String], default: [] },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Hall || mongoose.model('Hall', HallSchema);

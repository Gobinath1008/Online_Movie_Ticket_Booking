import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';

export async function GET(request, props) {
  const params = await props.params;
  await connectDB();
  const vehicle = await Vehicle.findById(params.id);
  if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
  return NextResponse.json(vehicle);
}
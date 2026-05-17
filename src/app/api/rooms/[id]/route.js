import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GuestRoom from '@/models/GuestRoom';

export async function GET(request, props) {
  const params = await props.params;
  await connectDB();
  const room = await GuestRoom.findById(params.id);
  if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });
  return NextResponse.json(room);
}
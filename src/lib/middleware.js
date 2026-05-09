import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function requireAuth(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ message: 'Not authenticated' }, { status: 401 }) };
  }
  const user = verifyToken(token);
  if (!user) {
    return { error: NextResponse.json({ message: 'Invalid token' }, { status: 401 }) };
  }
  return { user };
}

export async function requireAdmin(request) {
  const { user, error } = await requireAuth(request);
  if (error) return { error };
  if (user.role !== 'admin') {
    return { error: NextResponse.json({ message: 'Admin access required' }, { status: 403 }) };
  }
  return { user };
}

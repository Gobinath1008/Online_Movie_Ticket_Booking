import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default async function AdminLayout({ children }) {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin' && user.role !== 'super-admin') redirect('/dashboard');
  return (
    <div className="page-wrap">
      <Navbar user={user} />
      <main>{children}</main>
    </div>
  );
}
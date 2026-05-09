import { getServerUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default async function PublicLayout({ children }) {
  const user = await getServerUser();
  return (
    <div className="page-wrap">
      <Navbar user={user} />
      <main>{children}</main>
    </div>
  );
}

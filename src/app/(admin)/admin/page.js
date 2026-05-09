'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

const STATUS_COLORS = {
  pending: 'var(--warning)', approved: 'var(--success)', rejected: 'var(--danger)',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ halls: 0, total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [hallsRes, bookingsRes] = await Promise.all([
        fetch('/api/halls'), fetch('/api/bookings'),
      ]);
      const halls = await hallsRes.json();
      const bookings = await bookingsRes.json();
      const b = Array.isArray(bookings) ? bookings : [];
      setStats({
        halls: Array.isArray(halls) ? halls.length : 0,
        total: b.length,
        pending: b.filter(x => x.status === 'pending').length,
        approved: b.filter(x => x.status === 'approved').length,
        rejected: b.filter(x => x.status === 'rejected').length,
      });
      setRecent(b.slice(0, 6));
      setLoading(false);
    };
    fetchAll();
  }, []);

  const STAT_CARDS = [
    { icon: '🏛️', label: 'Total Halls', value: stats.halls, color: 'var(--primary)' },
    { icon: '📅', label: 'Total Bookings', value: stats.total, color: 'var(--accent)' },
    { icon: '⏳', label: 'Pending', value: stats.pending, color: 'var(--warning)' },
    { icon: '✅', label: 'Approved', value: stats.approved, color: 'var(--success)' },
  ];

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.adminBadge}>🛡️ ADMIN PANEL</div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>KIOT Hall Booking Management System</p>
          </div>
          <div className={styles.quickActions}>
            <Link href="/admin/halls" className="btn-secondary">🏛️ Manage Halls</Link>
            <Link href="/admin/bookings?status=pending" className="btn-primary">⏳ Review Pending ({stats.pending})</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions grid */}
        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {[
              { href: '/admin/halls', icon: '🏛️', label: 'Manage Halls', sub: 'Add, edit, deactivate halls', bg: '#1A1050' },
              { href: '/admin/bookings', icon: '📋', label: 'All Bookings', sub: 'View all booking requests', bg: '#0D1F40' },
              { href: '/admin/bookings?status=pending', icon: '⏳', label: `Pending (${stats.pending})`, sub: 'Approve or reject requests', bg: '#2A1500' },
              { href: '/admin/halls', icon: '➕', label: 'Add New Hall', sub: 'Register a new hall', bg: '#0D2A1A' },
            ].map(a => (
              <Link key={a.href + a.label} href={a.href} className={styles.actionCard} style={{ background: a.bg }}>
                <div className={styles.actionIcon}>{a.icon}</div>
                <div className={styles.actionLabel}>{a.label}</div>
                <div className={styles.actionSub}>{a.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2 className={styles.sectionTitle}>Recent Booking Requests</h2>
            <Link href="/admin/bookings" className={styles.seeAll}>See all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 120 }}>
              <div className="empty-title">No bookings yet</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Hall</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>{b.user?.name?.[0]?.toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.user?.department || b.user?.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>{b.hall?.name}</td>
                      <td>{b.date}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{b.startTime}–{b.endTime}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.purpose}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

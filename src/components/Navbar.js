'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const isAdmin = user?.role === 'admin';

  let navLinks = [];
  if (user) {
    navLinks = isAdmin
      ? [
        { href: '/admin', label: '📊 Dashboard' },
        { href: '/admin/halls', label: '🏛️ Halls' },
        { href: '/admin/bookings', label: '📋 Bookings' },
      ]
      : [
        { href: '/', label: '🏛️ Halls' },
        { href: '/my-bookings', label: '📄 My Bookings' },
        { href: '/messages', label: '💬 Messages' },
      ];
  } else {
    navLinks = [
      { href: '/', label: '🏛️ Halls' }
    ];
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="KIOT Logo" className={styles.logoImage} />
          <div>
            <span className={styles.logoName}>KIOT</span>
            <span className={styles.logoSub}>Hall Booking</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.links}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.link} ${pathname === l.href ? styles.linkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* User info + logout or Login */}
        <div className={styles.right}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
                <div className={styles.userText}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={`${styles.roleBadge} ${isAdmin ? styles.adminBadge : styles.studentBadge}`}>
                    {isAdmin ? '🛡️ Admin' : user.role}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <span>🚪</span> Logout
              </button>
            </>
          ) : (
            <div className={styles.guestLinks} style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login" className="btn-secondary btn-sm" style={{ padding: '6px 12px' }}>Login</Link>
              <Link href="/register" className="btn-primary btn-sm" style={{ padding: '6px 12px' }}>Register</Link>
            </div>
          )}
          {/* Mobile menu toggle */}
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className={styles.mobileLogout}>🚪 Logout</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px' }}>
              <Link href="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

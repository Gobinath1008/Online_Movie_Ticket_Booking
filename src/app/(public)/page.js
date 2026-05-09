'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

const CAPACITY_FILTERS = [
  { label: 'All Sizes', value: '' },
  { label: '50+ seats', value: '50' },
  { label: '100+ seats', value: '100' },
  { label: '200+ seats', value: '200' },
  { label: '500+ seats', value: '500' },
];

const FACILITY_ICONS = {
  'Projector': '📽️', 'AC': '❄️', 'Whiteboard': '📋', 'WiFi': '📶',
  'Mic': '🎤', 'Sound System': '🔊', 'Stage': '🎭', 'Camera': '📷',
};

export default function DashboardPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (capacityFilter) params.set('minCapacity', capacityFilter);
    try {
      const res = await fetch(`/api/halls?${params}`);
      const data = await res.json();
      setHalls(Array.isArray(data) ? data : []);
    } catch {
      setHalls([]);
    } finally {
      setLoading(false);
    }
  }, [search, capacityFilter]);

  useEffect(() => {
    const t = setTimeout(fetchHalls, 350);
    return () => clearTimeout(t);
  }, [fetchHalls]);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Find & Book a Hall</h1>
            <p className={styles.heroSub}>Browse available halls and submit your booking request</p>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{halls.length}</span>
            <span className={styles.heroStatLabel}>Halls Available</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              id="hall-search" type="text" className={styles.searchInput}
              placeholder="Search halls by name, location, or facilities..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className={styles.chips}>
            {CAPACITY_FILTERS.map(f => (
              <button key={f.value} className={`chip ${capacityFilter === f.value ? 'active' : ''}`}
                onClick={() => setCapacityFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hall Grid */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : halls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <div className="empty-title">No halls found</div>
            <div className="empty-sub">Try a different search or filter</div>
          </div>
        ) : (
          <div className={styles.hallGrid}>
            {halls.map((hall, i) => (
              <div key={hall._id} className={styles.hallCard} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.hallCardBanner}>
                  <span className={styles.hallEmoji}>🏛️</span>
                  <div className={styles.hallCapacityBadge}>👥 {hall.capacity} seats</div>
                </div>
                <div className={styles.hallCardBody}>
                  <h3 className={styles.hallName}>{hall.name}</h3>
                  <p className={styles.hallLocation}>📍 {hall.location}</p>
                  {hall.description && <p className={styles.hallDesc}>{hall.description}</p>}
                  {hall.facilities?.length > 0 && (
                    <div className={styles.facilitiesList}>
                      {hall.facilities.slice(0, 4).map(f => (
                        <span key={f} className={styles.facilityTag}>
                          {FACILITY_ICONS[f] || '✨'} {f}
                        </span>
                      ))}
                      {hall.facilities.length > 4 && (
                        <span className={styles.facilityMore}>+{hall.facilities.length - 4} more</span>
                      )}
                    </div>
                  )}
                  <div className={styles.hallCardActions}>
                    <Link href={`/halls/${hall._id}`} className="btn-secondary btn-sm">View Details</Link>
                    <Link href={`/halls/${hall._id}`} className="btn-primary btn-sm">📅 Book Hall</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

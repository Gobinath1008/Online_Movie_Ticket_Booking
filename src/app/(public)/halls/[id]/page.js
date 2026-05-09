'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './hall.module.css';

const FACILITY_ICONS = {
  'Projector': '📽️', 'AC': '❄️', 'Whiteboard': '📋', 'WiFi': '📶',
  'Mic': '🎤', 'Sound System': '🔊', 'Stage': '🎭', 'Camera': '📷', 'Chairs': '🪑', 'Tables': '🪑',
};

export default function HallDetailPage() {
  const { id } = useParams();
  const [hall, setHall] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to check in-progress bookings
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if booking is currently in progress
  const isBookingInProgress = (booking) => {
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) return false;

    const now = new Date();
    const [startH, startM] = booking.startTime.split(':').map(Number);
    const [endH, endM] = booking.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hallRes, bookingsRes] = await Promise.all([
          fetch(`/api/halls/${id}`),
          fetch(`/api/bookings/hall/${id}`),
        ]);
        setHall(await hallRes.json());
        const bookingsData = await bookingsRes.json();
        // Sort by date and time
        const sorted = (Array.isArray(bookingsData) ? bookingsData : []).sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        });
        setBookings(sorted);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!hall || hall.message) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--danger)' }}>Hall not found.</div>;

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className="container">
          <Link href="/" className={styles.backBtn}>← Back to Halls</Link>
          <div className={styles.bannerContent}>
            <div className={styles.bannerIcon}>🏛️</div>
            <div className={styles.bannerText}>
              <h1 className={styles.hallName}>{hall.name}</h1>
              <p className={styles.hallLocation}>📍 {hall.location}</p>
            </div>
            <div className={styles.bannerStats}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{hall.capacity}</span>
                <span className={styles.statLbl}>Capacity</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBox}>
                <span className={styles.statNum}>{hall.facilities?.length || 0}</span>
                <span className={styles.statLbl}>Facilities</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBox}>
                <span className={styles.statNum}>{bookings.length}</span>
                <span className={styles.statLbl}>Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          {/* Left */}
          <div>
            {hall.description && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>About This Hall</h2>
                <p className={styles.description}>{hall.description}</p>
              </div>
            )}

            {hall.facilities?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Available Facilities</h2>
                <div className={styles.facilitiesGrid}>
                  {hall.facilities.map(f => (
                    <div key={f} className={styles.facilityCard}>
                      <span className={styles.facilityIcon}>{FACILITY_ICONS[f] || '✨'}</span>
                      <span className={styles.facilityName}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Schedule */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>📅 Booking Schedule</h2>
              {bookings.length === 0 ? (
                <div className={styles.availableBox}>
                  <span className={styles.availableIcon}>✅</span>
                  <div>
                    <div className={styles.availableTitle}>Hall is Available!</div>
                    <div className={styles.availableSub}>No upcoming bookings. You can book anytime.</div>
                  </div>
                </div>
              ) : (
                <div className={styles.slotList}>
                  {bookings.map((b, i) => {
                    const inProgress = isBookingInProgress(b);
                    return (
                      <div key={i} className={`${styles.slotItem} ${inProgress ? styles.inProgress : ''}`}>
                        <div className={styles.slotHeader}>
                          <div className={styles.slotDate}>📅 {b.date}</div>
                          <span className={`badge ${inProgress ? 'badge-warning' : 'badge-approved'}`}>
                            {inProgress ? '🔴 In Progress' : 'Booked'}
                          </span>
                        </div>
                        <div className={styles.slotTime}>🕐 {b.startTime} – {b.endTime}</div>
                        <div className={styles.slotInfo}>
                          <div className={styles.slotPurpose}>📋 <strong>Purpose:</strong> {b.purpose}</div>
                          <div className={styles.slotUser}>👤 <strong>Booked by:</strong> {b.user?.name || 'Unknown'}</div>
                        </div>
                        <Link 
                          href={`/messages?with=${b.user?._id}`} 
                          className="btn-secondary btn-sm"
                          style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}
                        >
                          💬 Message
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right sticky sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.bookCard}>
              <div className={styles.bookCardTop}>
                <span className={styles.bookIcon}>📅</span>
                <div>
                  <div className={styles.bookTitle}>Book This Hall</div>
                  <div className={styles.bookSub}>Submit a booking request</div>
                </div>
              </div>
              <div className={styles.bookDetails}>
                <div className={styles.bookDetail}><span>🏛️</span> {hall.name}</div>
                <div className={styles.bookDetail}><span>📍</span> {hall.location}</div>
                <div className={styles.bookDetail}><span>👥</span> Up to {hall.capacity} people</div>
              </div>
              <Link href={`/book/${hall._id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                📅 Book Now
              </Link>
              <p className={styles.bookNote}>Your request will be reviewed by admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

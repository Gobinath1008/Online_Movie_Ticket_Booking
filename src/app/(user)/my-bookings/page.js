'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './mybookings.module.css';

const TABS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];
const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };
const STATUS_ICONS = { pending: '⏳', approved: '✅', rejected: '❌', cancelled: '🚫' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch('/api/bookings/my');
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    setSelectedForCancel(id);
    setCancelReason('');
    setConfirmModal(true);
  };

  const confirmCancel = async () => {
    const id = selectedForCancel;
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      if (res.ok) {
        setConfirmModal(false);
        setSelectedForCancel(null);
        fetchBookings();
      } else { 
        const d = await res.json(); 
        alert(d.message);
        setConfirmModal(false);
        setSelectedForCancel(null);
      }
    } finally { setCancelling(null); }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const counts = { all: bookings.length, pending: bookings.filter(b => b.status === 'pending').length, approved: bookings.filter(b => b.status === 'approved').length, rejected: bookings.filter(b => b.status === 'rejected').length, cancelled: bookings.filter(b => b.status === 'cancelled').length };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const content = `
      <html>
      <head>
        <title>My Booking Details</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #6C63FF; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
          .pending { background: rgba(243,156,18,0.2); color: #F39C12; }
          .approved { background: rgba(46,204,113,0.2); color: #2ECC71; }
          .rejected { background: rgba(231,76,60,0.2); color: #E74C3C; }
          .cancelled { background: rgba(149,152,154,0.2); color: #6C757D; }
          .print-time { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>My Booking Details</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Hall</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Attendees</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(b => `
              <tr>
                <td>${b.hall?.name || 'N/A'}</td>
                <td>${b.hall?.location || 'N/A'}</td>
                <td>${b.date}</td>
                <td>${b.startTime} - ${b.endTime}</td>
                <td>${b.purpose}</td>
                <td>${b.attendees}</td>
                <td><span class="status ${b.status}">${b.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="print-time">Total Bookings: ${filtered.length}</div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="page-header">
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">{bookings.length} total booking requests</p>
          </div>
          <button onClick={handlePrint} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            🖨️ Print
          </button>
        </div>

        <div className="tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] > 0 && <span className={styles.tabCount}>{counts[tab]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No {activeTab === 'all' ? '' : activeTab} bookings</div>
            <div className="empty-sub">
              {activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab} bookings found.`}
            </div>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {filtered.map(b => (
              <div key={b._id} className={styles.bookingCard}>
                <div className={styles.bookingLeft}>
                  <div className={styles.statusIcon}>{STATUS_ICONS[b.status]}</div>
                  <div className={styles.bookingInfo}>
                    <div className={styles.bookingHall}>🏛️ {b.hall?.name}</div>
                    <div className={styles.bookingMeta}>
                      📅 {b.date} &nbsp;•&nbsp; 🕐 {b.startTime}–{b.endTime} &nbsp;•&nbsp; 📍 {b.hall?.location}
                    </div>
                    <div className={styles.bookingPurpose}>📋 {b.purpose}</div>
                    {b.adminNote && (
                      <div className={styles.adminNote}>💬 Admin: {b.adminNote}</div>
                    )}
                    {b.cancellationReason && (
                      <div className={styles.cancellationNote}>🚫 {b.cancelledBy === 'admin' ? 'Admin ' : 'User '}cancelled: {b.cancellationReason}</div>
                    )}
                  </div>
                </div>
                <div className={styles.bookingRight}>
                  <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  {['pending', 'approved'].includes(b.status) && (
                    <button className="btn-danger btn-sm" onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}>
                      {cancelling === b._id ? '...' : '🗑️ Cancel'}
                    </button>
                  )}
                  {b.status === 'approved' && (
                    <Link href={`/messages?with=${b.user?._id}`} className="btn-secondary btn-sm">
                      💬 Message
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {confirmModal && selectedForCancel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">🗑️ Cancel Booking</h2>
              <button className="modal-close" onClick={() => setConfirmModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: 12, color: 'var(--text)' }}>
                Are you sure you want to <strong>cancel</strong> this booking?
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Hall: <strong>{bookings.find(b => b._id === selectedForCancel)?.hall?.name}</strong> | {bookings.find(b => b._id === selectedForCancel)?.date}
              </p>
              <textarea 
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 12, borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13 }}
                rows={3}
              />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, fontStyle: 'italic' }}>
                This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, padding: '20px', paddingTop: 0 }}>
              <button className="btn-secondary" onClick={() => setConfirmModal(false)} disabled={cancelling === selectedForCancel} style={{ flex: 1 }}>
                Keep Booking
              </button>
              <button 
                className="btn-danger"
                onClick={confirmCancel} 
                disabled={cancelling === selectedForCancel}
                style={{ flex: 1 }}
              >
                {cancelling === selectedForCancel ? '...' : '🗑️ Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

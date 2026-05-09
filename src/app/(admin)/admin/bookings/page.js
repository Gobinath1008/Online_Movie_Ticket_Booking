'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './bookings.module.css';

const TABS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];
const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };

function ManageBookingsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('status') || 'all';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  useEffect(() => { fetchBookings(); }, []);

  const openReview = (b) => { setSelected(b); setAdminNote(b.adminNote || ''); setModal(true); };
  const closeModal = () => { setModal(false); setSelected(null); setConfirmModal(false); setPendingAction(null); };

  const showConfirmation = (status) => {
    setPendingAction(status);
    setConfirmModal(true);
  };

  const handleDecision = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${selected._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setConfirmModal(false);
      setPendingAction(null);
      closeModal(); 
      fetchBookings();
    } finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${selected._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setConfirmModal(false);
      setPendingAction(null);
      closeModal(); 
      fetchBookings();
    } finally { setUpdating(false); }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const content = `
      <html>
      <head>
        <title>Hall Booking Details</title>
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
        <h1>Hall Booking Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Hall</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Admin Note</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(b => `
              <tr>
                <td>${b.user?.name || 'N/A'}</td>
                <td>${b.hall?.name || 'N/A'}</td>
                <td>${b.date}</td>
                <td>${b.startTime} - ${b.endTime}</td>
                <td>${b.purpose}</td>
                <td>${b.attendees}</td>
                <td><span class="status ${b.status}">${b.status.toUpperCase()}</span></td>
                <td>${b.adminNote || '-'}</td>
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

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const counts = { all: bookings.length, pending: bookings.filter(b => b.status === 'pending').length, approved: bookings.filter(b => b.status === 'approved').length, rejected: bookings.filter(b => b.status === 'rejected').length, cancelled: bookings.filter(b => b.status === 'cancelled').length };

  return (
    <div className={styles.page}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="page-header">
            <h1 className="page-title">Manage Bookings</h1>
            <p className="page-subtitle">{bookings.length} total requests</p>
          </div>
          <button onClick={handlePrint} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            🖨️ Print Report
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
            <div className="empty-icon">📋</div>
            <div className="empty-title">No {activeTab === 'all' ? '' : activeTab} bookings</div>
            <div className="empty-sub">Check back later for new requests</div>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map(b => (
              <div key={b._id} className={styles.card} onClick={() => b.status === 'pending' && openReview(b)} style={{ cursor: b.status === 'pending' ? 'pointer' : 'default' }}>
                <div className={styles.cardTop}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{b.user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className={styles.userName}>{b.user?.name}</div>
                      <div className={styles.userMeta}>{b.user?.email} • {b.user?.department || b.user?.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    {b.status !== 'cancelled' && b.status !== 'rejected' && (
                      <button className="btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(b); setCancelReason(b.adminNote || ''); setPendingAction('cancel'); setConfirmModal(true); }} title="Cancel this booking">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.hallName}>🏛️ {b.hall?.name}</div>
                  <div className={styles.bookingMeta}>📅 {b.date} &nbsp;•&nbsp; 🕐 {b.startTime}–{b.endTime}</div>
                  <div className={styles.purpose}>📋 {b.purpose}</div>
                  {b.cancellationReason && (
                    <div style={{ marginTop: 8, padding: 8, fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(255,59,48,0.08)', borderRadius: 'var(--radius-sm)' }}>
                      🚫 {b.cancelledBy === 'admin' ? 'Admin' : 'User'} cancelled: {b.cancellationReason}
                    </div>
                  )}
                </div>
                {b.status === 'pending' && <div className={styles.actionHint}>Click to review →</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modal && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Review Booking</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>User</span><strong>{selected.user?.name} ({selected.user?.role})</strong></div>
              <div className={styles.summaryRow}><span>Hall</span><strong>{selected.hall?.name}</strong></div>
              <div className={styles.summaryRow}><span>Date</span><strong>{selected.date}</strong></div>
              <div className={styles.summaryRow}><span>Time</span><strong>{selected.startTime} – {selected.endTime}</strong></div>
              <div className={styles.summaryRow}><span>Purpose</span><strong>{selected.purpose}</strong></div>
              <div className={styles.summaryRow}><span>Attendees</span><strong>{selected.attendees}</strong></div>
              {selected.cancellationReason && (
                <div className={styles.summaryRow}><span>Cancelled</span><strong>{selected.cancelledBy === 'admin' ? 'Admin' : 'User'}: {selected.cancellationReason}</strong></div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Admin Note (optional)</label>
              <textarea className="form-input" rows={2} placeholder="Add a note for the user..."
                value={adminNote} onChange={e => setAdminNote(e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div className={styles.decisionBtns}>
              <button className="btn-danger" onClick={() => showConfirmation('rejected')} disabled={updating}>
                ❌ Reject
              </button>
              <button className="btn-success" onClick={() => showConfirmation('approved')} disabled={updating}>
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && pendingAction && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {pendingAction === 'cancel' ? '🗑️ Cancel Booking' : (pendingAction === 'approved' ? '✅ Confirm Approval' : '❌ Confirm Rejection')}
              </h2>
              <button className="modal-close" onClick={() => setConfirmModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: 12, color: 'var(--text)' }}>
                Are you sure you want to <strong>{pendingAction === 'approved' ? 'approve' : pendingAction === 'rejected' ? 'reject' : 'cancel'}</strong> this booking?
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Hall: <strong>{selected?.hall?.name}</strong> | {selected?.date} {selected?.startTime}–{selected?.endTime}
              </p>
              {pendingAction === 'cancel' && (
                <textarea 
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: 8, marginTop: 12, borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13 }}
                  rows={2}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, padding: '20px', paddingTop: 0 }}>
              <button className="btn-secondary" onClick={() => setConfirmModal(false)} disabled={updating} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                className={pendingAction === 'approved' ? 'btn-success' : pendingAction === 'cancel' ? 'btn-danger' : 'btn-danger'}
                onClick={() => pendingAction === 'cancel' ? handleCancel() : handleDecision(pendingAction)}
                disabled={updating}
                style={{ flex: 1 }}
              >
                {updating ? '...' : (pendingAction === 'approved' ? '✅ Approve' : pendingAction === 'cancel' ? '🗑️ Cancel' : '❌ Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManageBookingsPage() {
  return (
    <Suspense fallback={<div className="spinner-wrap"><div className="spinner" /></div>}>
      <ManageBookingsContent />
    </Suspense>
  );
}

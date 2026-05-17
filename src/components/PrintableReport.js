'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export default function PrintableReport({
  type = 'booking', // 'booking', 'approval', 'monthly'
  data = {},
  onClose,
}) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report - College Booking System</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
            .header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6C63FF; }
            .logo { width: 80px; height: 80px; background: #6C63FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; }
            .header-text h1 { font-size: 24px; color: #1f2937; margin-bottom: 5px; }
            .header-text p { color: #6b7280; font-size: 14px; }
            .report-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #1f2937; }
            .meta { display: flex; gap: 30px; margin-bottom: 30px; }
            .meta-item { font-size: 14px; }
            .meta-item strong { color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: 600; color: #374151; font-size: 14px; }
            td { font-size: 14px; }
            .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-rejected { background: #fee2e2; color: #991b1b; }
            .status-cancelled { background: #f3f4f6; color: #6b7280; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-card { flex: 1; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .summary-card h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .summary-card .value { font-size: 28px; font-weight: 700; color: #1f2937; }
            .signature { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
            .signature-box { width: 200px; text-align: center; }
            .signature-box .line { border-bottom: 1px solid #374151; margin-bottom: 8px; height: 40px; }
            .signature-box .label { font-size: 14px; color: #6b7280; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      approved: 'status-approved',
      pending: 'status-pending',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-approved'
    };
    return classes[status] || '';
  };

  const bookings = Array.isArray(data.bookings) ? data.bookings : [];
  const stats = data.stats || {};

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* Print Content */}
        <div ref={printRef} className="p-8">
          {/* Header */}
          <div className="header">
            <div className="logo">🎓</div>
            <div className="header-text">
              <h1>College Resource Booking System</h1>
              <p>Your Premier Booking Management Platform</p>
            </div>
          </div>

          {/* Report Title */}
          <div className="report-title">
            {type === 'booking' && '📋 Booking Report'}
            {type === 'approval' && '✅ Approval Report'}
            {type === 'monthly' && '📊 Monthly Statistics Report'}
          </div>

          {/* Meta Info */}
          <div className="meta">
            <div className="meta-item">
              <strong>Generated:</strong> {formatDate(new Date())}
            </div>
            <div className="meta-item">
              <strong>Report Type:</strong> {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            {data.period && (
              <div className="meta-item">
                <strong>Period:</strong> {data.period}
              </div>
            )}
          </div>

          {/* Summary Cards for Monthly */}
          {type === 'monthly' && (
            <div className="summary">
              <div className="summary-card">
                <h3>Total Bookings</h3>
                <div className="value">{stats.totalBookings || 0}</div>
              </div>
              <div className="summary-card">
                <h3>Approved</h3>
                <div className="value" style={{ color: '#059669' }}>{stats.approved || 0}</div>
              </div>
              <div className="summary-card">
                <h3>Pending</h3>
                <div className="value" style={{ color: '#d97706' }}>{stats.pending || 0}</div>
              </div>
              <div className="summary-card">
                <h3>Rejected</h3>
                <div className="value" style={{ color: '#dc2626' }}>{stats.rejected || 0}</div>
              </div>
            </div>
          )}

          {/* Booking Table */}
          {bookings.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 50).map((booking) => (
                  <tr key={booking._id}>
                    <td>#{booking._id?.slice(-6)}</td>
                    <td>
                      {booking.serviceType === 'hall' && '🏛️ Hall'}
                      {booking.serviceType === 'vehicle' && '🚗 Vehicle'}
                      {booking.serviceType === 'room' && '🛏️ Room'}
                    </td>
                    <td>{booking.guestName || booking.user?.name || 'N/A'}</td>
                    <td>
                      {booking.hallDate || booking.vehiclePickupDate || booking.roomCheckInDate}
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {bookings.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              No bookings found for this report.
            </p>
          )}

          {/* Signature Section */}
          <div className="signature">
            <div className="signature-box">
              <div className="line"></div>
              <div className="label">Prepared By</div>
            </div>
            <div className="signature-box">
              <div className="line"></div>
              <div className="label">Checked By</div>
            </div>
            <div className="signature-box">
              <div className="line"></div>
              <div className="label">Approved By</div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            This is a computer-generated document. No signature is required.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
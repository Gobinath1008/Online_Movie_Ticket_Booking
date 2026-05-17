'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const ROOM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'economy', label: 'Economy' },
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'family', label: 'Family' },
  { value: 'suite', label: 'Suite' },
];

const TYPE_ICONS = {
  economy: '🛏️',
  standard: '🛏️',
  deluxe: '✨',
  family: '👨‍👩‍👧‍👦',
  suite: '👑',
};


const ROOM_TYPE_COLORS = {
  economy: '#6b7280',
  standard: '#3b82f6',
  deluxe: '#8b5cf6',
  family: '#f59e0b',
  suite: '#FFD700',
};

export default function RoomBookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [occupancyFilter, setOccupancyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateBookings, setDateBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (typeFilter) params.set('roomType', typeFilter);
    if (cityFilter.trim()) params.set('city', cityFilter.trim());
    if (occupancyFilter) params.set('occupancy', occupancyFilter);
    try {
      const res = await fetch(`/api/rooms?${params}`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, cityFilter, occupancyFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRooms, 350);
    return () => clearTimeout(t);
  }, [fetchRooms]);

  const handleDateClick = async (info) => {
    const dateStr = info.dateStr;
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return; // Disallow past dates
    setSelectedDate(dateStr);
    setLoadingBookings(true);
    try {
      const res = await fetch(`/api/bookings?all=true&serviceType=room`);
      const data = await res.json();
      // Filter bookings that overlap with selected date
      const activeBookings = Array.isArray(data) ? data.filter(b => {
        return b.roomCheckInDate <= dateStr && b.roomCheckOutDate >= dateStr;
      }) : [];
      setDateBookings(activeBookings);
    } catch {
      setDateBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getRoomStatus = (roomId) => {
    const isBooked = dateBookings.some(b => b.serviceId === roomId && b.status !== 'rejected' && b.status !== 'cancelled');
    return isBooked ? 'fully-booked' : 'available';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>🏨</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937' }}>Guest Room Booking</h1>
        </div>
        <p style={{ color: '#6b7280' }}>Reserve comfortable rooms for your stay</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: '24px' }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search rooms by name, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px',
              border: '1px solid #e5e7eb', fontSize: '15px', background: '#fff'
            }}
          />
        </div>
      </motion.div>

      {/* Calendar Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: '32px', background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Select a Date to Check Availability</h2>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          dateClick={handleDateClick}
          validRange={{ start: new Date().toISOString().split('T')[0] }}
          height="auto"
        />
        <style jsx global>{`
          .fc-daygrid-day { cursor: pointer; transition: background-color 0.2s; }
          .fc-daygrid-day:hover { background-color: #f3f4f6; }
          .fc-day-today { background-color: #e0e7ff !important; }
          .fc .fc-button-primary { background-color: #6C63FF; border-color: #6C63FF; }
          .fc .fc-button-primary:hover { background-color: #5b54d6; border-color: #5b54d6; }
        `}</style>
      </motion.div>

      {/* Room Grid */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            Rooms Available on {new Date(selectedDate).toLocaleDateString()}
          </h2>
          {loadingBookings ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏨</div>
              <div className="empty-title">No rooms found</div>
              <div className="empty-sub">Try adjusting your search or filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {rooms.map((room, idx) => {
                const status = getRoomStatus(room._id);
                return (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: '#fff', borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Room Image */}
                  <div style={{
                    height: '180px',
                    backgroundImage: "url('/images/rooms.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${ROOM_TYPE_COLORS[room.roomType]}cc, rgba(0,0,0,0.3))` }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{TYPE_ICONS[room.roomType] || '🛏️'}</span>
                  </div>

                  {/* Room Details */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{room.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Room {room.roomNumber} • Floor {room.floor}</p>
                      </div>
                      <span className={`badge`} style={{
                        background: status === 'available' ? '#dcfce7' : '#fee2e2',
                        color: status === 'available' ? '#166534' : '#991b1b',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                        background: `${ROOM_TYPE_COLORS[room.roomType]}20`, color: ROOM_TYPE_COLORS[room.roomType]
                      }}>
                        {room.roomType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>👥 {room.occupancy} guests max</span>
                    </div>

                    {room.amenities?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {room.amenities.slice(0, 4).map(a => (
                          <span key={a} className="chip" style={{ fontSize: '11px' }}>{a}</span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="chip" style={{ fontSize: '11px' }}>+{room.amenities.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '100%' }}>
                        {status === 'fully-booked' ? (
                          <button disabled style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#e5e7eb', color: '#9ca3af', fontWeight: '500', cursor: 'not-allowed' }}>
                            Booked
                          </button>
                        ) : (
                          <Link
                            href={`/room-booking/${room._id}?date=${selectedDate}`}
                            className="btn-primary btn-sm"
                            style={{ textDecoration: 'none', width: '100%', display: 'block', textAlign: 'center' }}
                          >
                            Book Now →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Back to Home */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/" className="btn-secondary">← Back to Home</Link>
      </div>
    </div>
  );
}
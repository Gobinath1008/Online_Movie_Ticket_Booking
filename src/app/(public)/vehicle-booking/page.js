'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const VEHICLE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'car', label: 'Cars' },
  { value: 'van', label: 'Vans' },
  { value: 'bus', label: 'Buses' },
  { value: 'bike', label: 'Bikes' },
];

const FUEL_TYPES = {
  petrol: '⛽ Petrol',
  diesel: '⛽ Diesel',
  electric: '🔋 Electric',
  hybrid: '🔌 Hybrid',
};

const TYPE_ICONS = {
  car: '🚗',
  van: '🚐',
  bus: '🚌',
  bike: '🏍️',
};


export default function VehicleBookingPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateBookings, setDateBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (typeFilter) params.set('vehicleType', typeFilter);
    if (cityFilter.trim()) params.set('city', cityFilter.trim());
    try {
      const res = await fetch(`/api/vehicles?${params}`);
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, cityFilter]);

  useEffect(() => {
    const t = setTimeout(fetchVehicles, 350);
    return () => clearTimeout(t);
  }, [fetchVehicles]);

  const handleDateClick = async (info) => {
    const dateStr = info.dateStr;
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return; // Disallow past dates
    setSelectedDate(dateStr);
    setLoadingBookings(true);
    try {
      const res = await fetch(`/api/bookings?all=true&serviceType=vehicle`);
      const data = await res.json();
      // Filter bookings that overlap with selected date
      const activeBookings = Array.isArray(data) ? data.filter(b => {
        return b.vehiclePickupDate <= dateStr && b.vehicleReturnDate >= dateStr;
      }) : [];
      setDateBookings(activeBookings);
    } catch {
      setDateBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getVehicleStatus = (vehicleId) => {
    const isBooked = dateBookings.some(b => b.serviceId === vehicleId && b.status !== 'rejected' && b.status !== 'cancelled');
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
          <span style={{ fontSize: '32px' }}>🚗</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937' }}>Vehicle Booking</h1>
        </div>
        <p style={{ color: '#6b7280' }}>Rent cars, vans, buses, and bikes for your journey</p>
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
            placeholder="Search vehicles by name, model..."
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

      {/* Vehicle Grid */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            Vehicles Available on {new Date(selectedDate).toLocaleDateString()}
          </h2>
          {loadingBookings ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <div className="empty-title">No vehicles found</div>
              <div className="empty-sub">Try adjusting your search or filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {vehicles.map((vehicle, idx) => {
                const status = getVehicleStatus(vehicle._id);
                return (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: '#fff', borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Vehicle Image */}
                  <div style={{
                    height: '180px', 
                    backgroundImage: "url('/images/vehicles.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,145,178,0.7) 0%, rgba(5,150,105,0.7) 100%)' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{TYPE_ICONS[vehicle.vehicleType] || '🚗'}</span>
                  </div>

                  {/* Vehicle Details */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{vehicle.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>{vehicle.model} • {vehicle.year}</p>
                      </div>
                      <span className={`badge`} style={{
                        background: status === 'available' ? '#dcfce7' : '#fee2e2',
                        color: status === 'available' ? '#166534' : '#991b1b',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
                      <span>👥 {vehicle.capacity} seats</span>
                      <span>{FUEL_TYPES[vehicle.fuelType]}</span>
                    </div>

                    {vehicle.features?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {vehicle.features.slice(0, 3).map(f => (
                          <span key={f} className="chip" style={{ fontSize: '11px' }}>{f}</span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="chip" style={{ fontSize: '11px' }}>+{vehicle.features.length - 3}</span>
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
                            href={`/vehicle-booking/${vehicle._id}?date=${selectedDate}`}
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
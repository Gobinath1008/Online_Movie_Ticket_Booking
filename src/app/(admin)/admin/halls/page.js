'use client';
import { useState, useEffect } from 'react';
import styles from './halls.module.css';

const FACILITIES_OPTIONS = ['Projector','AC','Whiteboard','WiFi','Mic','Sound System','Stage','Chairs','Tables','Camera'];
const EMPTY_FORM = { name: '', capacity: '', location: '', description: '', facilities: [], isActive: true };

export default function ManageHallsPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchHalls = async () => {
    setLoading(true);
    const res = await fetch('/api/halls?all=true');
    setHalls(await res.json());
    setLoading(false);
  };
  useEffect(() => { fetchHalls(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, capacity: String(h.capacity), location: h.location, description: h.description || '', facilities: [...(h.facilities || [])], isActive: h.isActive !== false }); setErrors({}); setModal(true); };
  const closeModal = () => setModal(false);

  const toggleFacility = (f) => setForm(prev => ({ ...prev, facilities: prev.facilities.includes(f) ? prev.facilities.filter(x => x !== f) : [...prev.facilities, f] }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.capacity || isNaN(form.capacity)) e.capacity = 'Valid number required';
    if (!form.location.trim()) e.location = 'Required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = { name: form.name.trim(), capacity: parseInt(form.capacity), location: form.location.trim(), description: form.description.trim(), facilities: form.facilities, isActive: form.isActive };
    try {
      const res = await fetch(editing ? `/api/halls/${editing._id}` : '/api/halls', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      closeModal(); fetchHalls();
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (hall) => {
    if (!confirm(`Deactivate "${hall.name}"? It won't appear in listings.`)) return;
    await fetch(`/api/halls/${hall._id}`, { method: 'DELETE' });
    fetchHalls();
  };

  const handleActivate = async (hall) => {
    if (!confirm(`Activate "${hall.name}"? It will appear in listings.`)) return;
    const res = await fetch(`/api/halls/${hall._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) {
      fetchHalls();
    } else {
      alert('Failed to activate hall');
    }
  };

  const handleDelete = async (hall) => {
    if (!confirm(`Are you sure you want to permanently delete "${hall.name}"? This action cannot be undone.`)) return;
    const res = await fetch(`/api/halls/${hall._id}?permanent=true`, { method: 'DELETE' });
    if (res.ok) {
      fetchHalls();
    } else {
      alert('Failed to delete hall');
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className="page-title">Manage Halls</h1>
            <p className="page-subtitle">{halls.length} halls registered</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>➕ Add New Hall</button>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : halls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <div className="empty-title">No halls yet</div>
            <div className="empty-sub">Add your first hall to get started</div>
          </div>
        ) : (
          <div className={styles.hallGrid}>
            {halls.map(h => (
              <div key={h._id} className={styles.hallCard}>
                <div className={styles.hallTop}>
                  <span className={styles.hallEmoji}>🏛️</span>
                  <div className={styles.hallInfo}>
                    <div className={styles.hallName}>
                      {h.name}
                      {h.isActive === false && <span className="badge badge-rejected" style={{marginLeft: '8px', fontSize: '10px'}}>Hidden</span>}
                    </div>
                    <div className={styles.hallMeta}>📍 {h.location} &nbsp;•&nbsp; 👥 {h.capacity} seats</div>
                    {h.facilities?.length > 0 && (
                      <div className={styles.facilities}>{h.facilities.map(f => <span key={f} className={styles.facilityTag}>{f}</span>)}</div>
                    )}
                  </div>
                </div>
                <div className={styles.hallActions}>
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(h)}>✏️ Edit</button>
                  {h.isActive !== false ? (
                    <button className="btn-danger btn-sm" onClick={() => handleDeactivate(h)}>🗑️ Deactivate</button>
                  ) : (
                    <button className="btn-primary btn-sm" onClick={() => handleActivate(h)}>✅ Activate</button>
                  )}
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(h)} style={{opacity: 0.7}}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Hall' : 'Add New Hall'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Hall Name</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Main Auditorium"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <div className="error-msg">{errors.name}</div>}
            </div>

            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Capacity (seats)</label>
                <input className={`form-input ${errors.capacity ? 'error' : ''}`} type="number" placeholder="e.g. 200"
                  value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                {errors.capacity && <div className="error-msg">{errors.capacity}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className={`form-input ${errors.location ? 'error' : ''}`} placeholder="e.g. Block B, Floor 2"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                {errors.location && <div className="error-msg">{errors.location}</div>}
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Visible to Users (Active)</label>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-input" rows={3} placeholder="Brief description..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Facilities</label>
              <div className={styles.facilitiesGrid}>
                {FACILITIES_OPTIONS.map(f => (
                  <button key={f} type="button"
                    className={`chip ${form.facilities.includes(f) ? 'active' : ''}`}
                    onClick={() => toggleFacility(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : editing ? '✅ Update Hall' : '➕ Create Hall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

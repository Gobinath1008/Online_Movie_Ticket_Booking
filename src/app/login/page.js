'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@kiot\.ac\.in$/.test(form.email)) {
      newErrors.email = 'Only @kiot.ac.in emails are allowed';
    }

    // Password validation
    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      if (data.user.role === 'admin') router.push('/admin');
      else router.push('/my-bookings');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Right panel - login form */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Welcome back</h2>
              <p className={styles.formSubtitle}>Sign in to your account</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="email" name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@kiot.ac.in" value={form.email} onChange={handleChange}
                />
                {errors.email && <div className="error-msg">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="password" name="password" type="password" className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password" value={form.password} onChange={handleChange}
                />
                {errors.password && <div className="error-msg">{errors.password}</div>}
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </button>
            </form>

            <div className={styles.formFooter}>
              <p>Don't have an account? <Link href="/register" className={styles.authLink}>Register here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

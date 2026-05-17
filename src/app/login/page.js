'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@kiot\.ac\.in$/.test(form.email))
      errs.email = 'Only @kiot.ac.in emails are allowed';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      if (data.user.role === 'admin' || data.user.role === 'super-admin') router.push('/admin');
      else router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Right form panel ── */}
      <div className={styles.rightPanel}>
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>

          <div className={styles.formHeader}>
            <div className={styles.formIconWrap}>🏛️</div>
            <h1 className={styles.formTitle}>Welcome Back</h1>
            <p className={styles.formSubtitle}>Sign in to access your bookings</p>
          </div>

          {/* Error alert */}
          {error && (
            <motion.div
              className={`${styles.alertBox} ${styles.alertError}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel} htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@kiot.ac.in"
                value={form.email}
                onChange={handleChange}
                className={`${styles.fieldInput} ${errors.email ? styles.hasError : ''}`}
              />
              {errors.email && <p className={styles.fieldError}>⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel} htmlFor="login-password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`${styles.fieldInput} ${errors.password ? styles.hasError : ''}`}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className={styles.fieldError}>⚠ {errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <span className={styles.spinnerInBtn} />
                  Signing in…
                </>
              ) : '🚀 Sign In'}
            </motion.button>
          </form>

          <div className={styles.hintBox}>
            Use your official <span>@kiot.ac.in</span> email to access the system.
          </div>

          <div className={styles.formFooter}>
            Don't have an account?{' '}
            <Link href="/register" className={styles.authLink}>Register here</Link>
          </div>
        </motion.div>

        <p style={{ marginTop: 20, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          KIOT Resource Booking System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

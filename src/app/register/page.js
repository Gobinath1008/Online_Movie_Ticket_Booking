'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '', courseType: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ugDepartments = [
      "B.E Mechanical Engineering",
      "B.E Electronics and Communication Engineering",
      "B.E Electrical and Electronics Engineering",
      "B.E Computer Science and Engineering",
      "B.E Civil Engineering",
      "B.Tech Information Technology",
      "B.Tech Computer Science and Business Systems",
      "B.Tech Artificial Intelligence and Data Science",
      "B.E Electronics and Computer Engineering"
  ];

  const pgDepartments = [
      "M.E Industrial Safety Engineering",
      "M.E VLSI Design",
      "M.E Automotive Electronics",
      "M.E Embedded System Technologies",
      "M.E Computer Science and Engineering",
      "Master of Business Administration (MBA)",
      "MCA – Master of Computer Applications",
      "MBA in Innovation, Entrepreneurship & Venture Development (MBA-IEV)",
      "M.E Software Engineering"
  ];

  const departmentsList =
      form.courseType === "UG"
          ? ugDepartments
          : form.courseType === "PG"
          ? pgDepartments
          : [];

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(form.name)) {
      newErrors.name = 'Name can only contain letters, spaces, dots, hyphens, and apostrophes';
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@kiot\.ac\.in$/.test(form.email)) {
      newErrors.email = 'Only @kiot.ac.in emails are allowed';
    }

    // Department and Course validation
    if (!form.courseType) {
      newErrors.courseType = 'Course Type is required';
    }
    if (!form.department) {
      newErrors.department = 'Department is required';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 50) {
      newErrors.password = 'Password must not exceed 50 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          courseType: form.courseType,
          department: form.department,
        }),
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

        {/* Right form panel */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>Fill in your details to register</p>
            </div>
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="name" name="name" type="text" className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Gobinath S" value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <div className="error-msg">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="email" name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="example@kiot.ac.in" value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
                {errors.email && <div className="error-msg">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Course Type</label>
                <select
                  name="courseType"
                  className={`form-input ${errors.courseType ? 'error' : ''}`}
                  value={form.courseType}
                  onChange={e => {
                    set('courseType', e.target.value);
                    set('department', '');
                  }}
                >
                  <option value="">Select Course Type</option>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
                {errors.courseType && <div className="error-msg">{errors.courseType}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className={`form-input ${errors.department ? 'error' : ''}`}
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  disabled={!form.courseType}
                >
                  <option value="">Select Department</option>
                  {departmentsList.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <div className="error-msg">{errors.department}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="password" name="password" type="password" className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min 6 chars (A-Z, a-z, 0-9)" value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                {errors.password && <div className="error-msg">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                />
                {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Creating account...' : '✅ Create Account'}
              </button>
            </form>
            <div className={styles.formFooter}>
              <p>Already have an account? <Link href="/login" className={styles.authLink}>Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Alert } from '../../components/common';

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🔧 ISRM</h1>
          <p>Internal Service Request Manager</p>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Sign in to your account</h2>

        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Your password"
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--color-bg)', borderRadius: 'var(--border-radius)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <strong>Demo credentials:</strong><br />
          Admin: admin@cubx.com / Admin123!<br />
          Employee: employee@cubx.com / Employee123!
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

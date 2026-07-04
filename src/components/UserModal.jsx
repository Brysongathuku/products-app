import { useState } from 'react';

const EMPTY = { fullName: '', username: '', email: '', password: '', confirmPassword: '', role: 'USER' };

export default function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...user, password: '', confirmPassword: '' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.fullName?.trim()) errs.fullName = 'Full name is required';
    if (!form.username?.trim()) errs.username = 'Username is required';
    if (!form.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';

    if (!isEdit) {
      if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    } else if (form.password && form.password.length > 0) {
      if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setApiError('');
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        role: form.role,
      };
      if (form.password) payload.password = form.password;
      await onSave(payload);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name *</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoFocus />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>
          <div className="field">
            <label>Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={isEdit} />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>
          <div className="field">
            <label>Email *</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="field-row">
            <div className="field">
              <label>{isEdit ? 'New Password (optional)' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>
            <div className="field">
              <label>Confirm Password{isEdit ? '' : ' *'}</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="field">
            <label>Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {apiError && <p className="error-text">{apiError}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

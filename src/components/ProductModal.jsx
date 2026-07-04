import { useState } from 'react';

const EMPTY = { name: '', description: '', category: '', price: '', quantity: '', imageUrl: '' };

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? { ...EMPTY, ...product } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name || !form.name.trim()) errs.name = 'Product name is required';
    if (form.price === '' || form.price === null || Number(form.price) <= 0) {
      errs.price = 'Price must be greater than zero';
    }
    if (form.quantity === '' || form.quantity === null || Number(form.quantity) < 0) {
      errs.quantity = 'Quantity cannot be negative';
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
      await onSave({
        ...form,
        price: Number(form.price),
        quantity: parseInt(form.quantity, 10),
      });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Product Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Price *</label>
              <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              {errors.price && <p className="error-text">{errors.price}</p>}
            </div>
            <div className="field">
              <label>Quantity *</label>
              <input type="number" step="1" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              {errors.quantity && <p className="error-text">{errors.quantity}</p>}
            </div>
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
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

import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';

const PAGE_SIZE = 8;

export default function UsersPage() {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users', {
        params: { search: debouncedSearch, page, size: PAGE_SIZE },
      });
      setData(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (payload) => {
    if (modalUser && modalUser.id) {
      await api.put(`/users/${modalUser.id}`, payload);
    } else {
      await api.post('/users', payload);
    }
    setModalUser(undefined);
    fetchUsers();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      alert('Failed to delete user');
      setDeleteTarget(null);
    }
  };

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/users/${u.id}/status`, null, { params: { status: newStatus } });
      fetchUsers();
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="actions-group">
          <button className="btn btn-accent" onClick={() => setModalUser(null)}>+ Add User</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table>
        <thead>
          <tr>
            <th className="no-sort">Name</th>
            <th className="no-sort">Username</th>
            <th className="no-sort">Email</th>
            <th className="no-sort">Role</th>
            <th className="no-sort">Status</th>
            <th className="no-sort">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="empty-state">Loading...</td></tr>
          ) : data.content.length === 0 ? (
            <tr><td colSpan={6} className="empty-state">No users found.</td></tr>
          ) : (
            data.content.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>{u.status}</span></td>
                <td className="row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setModalUser(u)}>Edit</button>
                  <button className="btn btn-warning btn-sm" onClick={() => toggleStatus(u)}>
                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(u)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <span>
          Page {data.totalElements === 0 ? 0 : page + 1} of {data.totalPages} &middot; {data.totalElements} total
        </span>
        <div className="controls">
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button className="btn btn-outline btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User?"
          message={`Are you sure you want to delete "${deleteTarget.fullName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

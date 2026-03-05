import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/usersApi';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/common/Badge';
import { LoadingOverlay, EmptyState, ConfirmDialog, Alert } from '../../components/common';
import { User } from '../../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = (): void => {
    setIsLoading(true);
    usersApi
      .getAll()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(deleteTarget);
      setDeleteTarget(null);
      setSuccessMsg('User deleted successfully.');
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-content">
        <div className="page-title-row">
          <h1 className="page-title">Users</h1>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {users.length} total users
          </span>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {isLoading ? (
          <LoadingOverlay />
        ) : users.length === 0 ? (
          <div className="card">
            <EmptyState icon="👥" title="No users found" />
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{u.email}</td>
                    <td><Badge value={u.role} type="role" /></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="Delete user"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => setDeleteTarget(u._id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message="Are you sure you want to delete this user? All their data will be preserved but they will lose access."
          confirmLabel="Delete User"
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </AppLayout>
  );
};

export default UsersPage;

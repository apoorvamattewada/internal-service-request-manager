import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ServiceRequestForm from '../../components/requests/ServiceRequestForm';
import { LoadingOverlay, EmptyState, Modal, ConfirmDialog, Alert } from '../../components/common';
import { Priority, Status, ServiceRequestFilters, CreateServiceRequestPayload } from '../../types';

const ServiceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requests, isLoading, error, fetchAll, create, remove, clearError } = useServiceRequests();

  const [filters, setFilters] = useState<ServiceRequestFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadRequests = useCallback(
    (f: ServiceRequestFilters) => void fetchAll(f),
    [fetchAll]
  );

  useEffect(() => {
    loadRequests(filters);
  }, [filters, loadRequests]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: keyof ServiceRequestFilters, value: string): void => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleCreate = async (data: Partial<CreateServiceRequestPayload>): Promise<void> => {
    setIsCreating(true);
    try {
      await create(data as CreateServiceRequestPayload);
      setShowCreateModal(false);
      setSuccessMsg('Service request created successfully!');
      loadRequests(filters);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await remove(deleteTarget);
      setDeleteTarget(null);
      setSuccessMsg('Service request deleted.');
      loadRequests(filters);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-content">
        <div className="page-title-row">
          <h1 className="page-title">Service Requests</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Request
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={clearError} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select filter-select"
            value={filters.status ?? ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.values(Status).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="form-select filter-select"
            value={filters.priority ?? ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            {Object.values(Priority).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            className="form-select filter-select"
            value={String(filters.limit ?? 10)}
            onChange={(e) => setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingOverlay />
        ) : (requests?.data.length ?? 0) === 0 ? (
          <div className="card">
            <EmptyState
              icon="📋"
              title="No service requests found"
              description="Create your first service request to get started."
              action={
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  + Create Request
                </button>
              }
            />
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests?.data.map((req) => (
                  <tr key={req._id} onClick={() => navigate(`/requests/${req._id}`)}>
                    <td style={{ fontWeight: 500, maxWidth: '240px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.title}
                      </span>
                    </td>
                    <td><Badge value={req.priority} type="priority" /></td>
                    <td><Badge value={req.status} type="status" /></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{req.createdBy?.name}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {req.assignedTo ? req.assignedTo.name : <span style={{ color: 'var(--color-text-light)' }}>Unassigned</span>}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon"
                          title="View"
                          onClick={() => navigate(`/requests/${req._id}`)}
                        >👁</button>
                        <button
                          className="btn-icon"
                          title="Delete"
                          onClick={() => setDeleteTarget(req._id)}
                          style={{ color: 'var(--color-danger)' }}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {requests?.pagination && (
              <Pagination
                pagination={requests.pagination}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="New Service Request" onClose={() => setShowCreateModal(false)}>
          <ServiceRequestForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
            isLoading={isCreating}
            submitLabel="Create Request"
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Service Request"
          message="Are you sure you want to delete this service request? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </AppLayout>
  );
};

export default ServiceRequestsPage;

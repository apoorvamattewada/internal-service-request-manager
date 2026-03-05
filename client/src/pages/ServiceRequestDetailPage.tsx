import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/common/Badge';
import ServiceRequestForm from '../../components/requests/ServiceRequestForm';
import { LoadingOverlay, Modal, ConfirmDialog, Alert } from '../../components/common';
import { UpdateServiceRequestPayload } from '../../types';

const ServiceRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRequest, isLoading, error, fetchById, update, remove, clearError } =
    useServiceRequests();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (id) void fetchById(id);
  }, [id, fetchById]);

  const handleUpdate = async (data: Partial<UpdateServiceRequestPayload>): Promise<void> => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await update(id, data as UpdateServiceRequestPayload);
      setShowEditModal(false);
      setSuccessMsg('Service request updated successfully!');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await remove(id);
      navigate('/requests');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <AppLayout><LoadingOverlay /></AppLayout>;

  if (!currentRequest && !isLoading) {
    return (
      <AppLayout>
        <div className="page-content">
          <Alert type="error" message="Service request not found." />
          <button className="btn btn-secondary" onClick={() => navigate('/requests')}>
            ← Back to Requests
          </button>
        </div>
      </AppLayout>
    );
  }

  const req = currentRequest!;

  return (
    <AppLayout>
      <div className="page-content">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/requests')}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Requests
        </button>

        {error && <Alert type="error" message={error} onClose={clearError} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="card">
          <div className="detail-header">
            <div>
              <h1 className="detail-title">{req.title}</h1>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <Badge value={req.priority} type="priority" />
                <Badge value={req.status} type="status" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                🗑 Delete
              </button>
            </div>
          </div>

          <div className="detail-meta">
            <div className="meta-item">
              <label>Created By</label>
              <span>{req.createdBy?.name ?? 'Unknown'}</span>
            </div>
            <div className="meta-item">
              <label>Assigned To</label>
              <span>{req.assignedTo ? req.assignedTo.name : 'Unassigned'}</span>
            </div>
            <div className="meta-item">
              <label>Created At</label>
              <span>{new Date(req.createdAt).toLocaleString()}</span>
            </div>
            <div className="meta-item">
              <label>Last Updated</label>
              <span>{new Date(req.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Description
            </h3>
            <p className="detail-description">{req.description}</p>
          </div>
        </div>
      </div>

      {showEditModal && (
        <Modal title="Edit Service Request" onClose={() => setShowEditModal(false)}>
          <ServiceRequestForm
            initialData={req}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditModal(false)}
            isLoading={isUpdating}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Service Request"
          message={`Are you sure you want to delete "${req.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => void handleDelete()}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeleting}
        />
      )}
    </AppLayout>
  );
};

export default ServiceRequestDetailPage;

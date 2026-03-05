import React, { useState, useEffect } from 'react';
import { Priority, Status, ServiceRequest, User, UserRole } from '../../types';
import { Spinner, Alert } from '../common';
import { usersApi } from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
}

interface ServiceRequestFormProps {
  initialData?: ServiceRequest;
  onSubmit: (data: Partial<FormData>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel?: string;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Submit',
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [form, setForm] = useState<FormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    priority: initialData?.priority ?? Priority.MEDIUM,
    status: initialData?.status ?? Status.OPEN,
    assignedTo: (initialData?.assignedTo as User)?._id ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isAdmin) {
      usersApi.getAll().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    else if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!form.priority) newErrors.priority = 'Priority is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    try {
      const payload: Partial<FormData> = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      };
      if (isAdmin) {
        payload.status = form.status;
        payload.assignedTo = form.assignedTo || undefined;
      }
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div className="form-group">
        <label className="form-label required">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder="Brief description of the request"
          maxLength={200}
        />
        {errors.title && <p className="form-error">⚠ {errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          placeholder="Provide detailed information about the request..."
          rows={4}
          maxLength={2000}
        />
        {errors.description && <p className="form-error">⚠ {errors.description}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={`form-select ${errors.priority ? 'error' : ''}`}
          >
            {Object.values(Priority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.priority && <p className="form-error">⚠ {errors.priority}</p>}
        </div>

        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              {Object.values(Status).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="form-select">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--color-border)', marginTop: '8px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <Spinner /> : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ServiceRequestForm;

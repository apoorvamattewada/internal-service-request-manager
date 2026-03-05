import React, { ReactNode } from 'react';

// ─── Spinner ─────────────────────────────────────
export const Spinner: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <span className={`loading-spinner ${dark ? 'dark' : ''}`} />
);

export const LoadingOverlay: React.FC = () => (
  <div className="loading-overlay">
    <Spinner dark />
  </div>
);

// ─── Alert ────────────────────────────────────────
interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => (
  <div className={`alert alert-${type}`}>
    <span>{type === 'error' ? '⚠️' : '✅'}</span>
    <span style={{ flex: 1 }}>{message}</span>
    {onClose && (
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
      >
        ×
      </button>
    )}
  </div>
);

// ─── Modal ────────────────────────────────────────
interface ModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, footer, onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="btn-icon" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    {description && <p style={{ marginBottom: '16px' }}>{description}</p>}
    {action}
  </div>
);

// ─── Confirm Dialog ───────────────────────────────
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <Modal
    title={title}
    onClose={onCancel}
    footer={
      <>
        <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <Spinner /> : confirmLabel}
        </button>
      </>
    }
  >
    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{message}</p>
  </Modal>
);

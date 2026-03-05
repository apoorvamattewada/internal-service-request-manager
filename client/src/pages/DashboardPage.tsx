import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/common/Badge';
import { LoadingOverlay } from '../../components/common';
import { UserRole, Status, Priority } from '../../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { requests, fetchAll, isLoading } = useServiceRequests();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    void fetchAll({ limit: 5, page: 1 });
    if (user?.role === UserRole.ADMIN) {
      serviceRequestApi.getStats().then(setStats).catch(console.error);
    }
  }, [fetchAll, user]);

  const statCards = [
    { label: 'Open', value: stats[Status.OPEN] ?? 0, icon: '📬', color: '#e0f2fe', iconBg: '#0284c7' },
    { label: 'In Progress', value: stats[Status.IN_PROGRESS] ?? 0, icon: '⚙️', color: '#fef3c7', iconBg: '#d97706' },
    { label: 'Closed', value: stats[Status.CLOSED] ?? 0, icon: '✅', color: '#dcfce7', iconBg: '#16a34a' },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {user?.role === UserRole.ADMIN && (
          <div className="stat-grid">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="stat-icon" style={{ background: card.color, color: card.iconBg }}>
                  {card.icon}
                </div>
                <div className="stat-info">
                  <h3 style={{ color: card.iconBg }}>{card.value}</h3>
                  <p>{card.label} Requests</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Service Requests</h2>
            <Link to="/requests" className="btn btn-secondary btn-sm">View All</Link>
          </div>

          {isLoading ? (
            <LoadingOverlay />
          ) : (requests?.data.length ?? 0) > 0 ? (
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests?.data.map((req) => (
                    <tr key={req._id} onClick={() => window.location.assign(`/requests/${req._id}`)}>
                      <td style={{ fontWeight: 500, maxWidth: '250px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.title}
                        </span>
                      </td>
                      <td><Badge value={req.priority} type="priority" /></td>
                      <td><Badge value={req.status} type="status" /></td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        {req.createdBy?.name}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
              <p>No service requests yet.</p>
              <Link to="/requests/new" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Create First Request
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;

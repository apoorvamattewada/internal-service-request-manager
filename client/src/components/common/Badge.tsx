import React from 'react';
import { Priority, Status, UserRole } from '../../types';

interface BadgeProps {
  value: Priority | Status | UserRole | string;
  type: 'priority' | 'status' | 'role';
}

const statusClassMap: Record<string, string> = {
  Open: 'badge-open',
  'In Progress': 'badge-in-progress',
  Closed: 'badge-closed',
};

const priorityClassMap: Record<string, string> = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const roleClassMap: Record<string, string> = {
  admin: 'badge-admin',
  employee: 'badge-employee',
};

const Badge: React.FC<BadgeProps> = ({ value, type }) => {
  let className = 'badge ';

  if (type === 'status') className += statusClassMap[value] ?? '';
  else if (type === 'priority') className += priorityClassMap[value] ?? '';
  else if (type === 'role') className += roleClassMap[value] ?? '';

  return <span className={className}>{value}</span>;
};

export default Badge;

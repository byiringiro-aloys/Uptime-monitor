import React from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'up':
        return {
          icon: CheckCircle,
          text: 'Online',
          className: 'status-up'
        };
      case 'down':
        return {
          icon: XCircle,
          text: 'Offline',
          className: 'status-down'
        };
      default:
        return {
          icon: HelpCircle,
          text: 'Unknown',
          className: 'status-unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </span>
  );
};

export default StatusBadge;

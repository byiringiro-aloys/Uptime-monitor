import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Trash2,
  Clock,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';

const MonitorCard = ({ monitor, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatInterval = (ms) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const formatLastChecked = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const checked = new Date(date);
    const diffMs = now - checked;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the monitor for "${monitor.name}"?`)) {
      onDelete(monitor._id);
    }
    setShowMenu(false);
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {monitor.name}
          </h3>
          <div className="flex items-center mt-1">
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-responsive-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center truncate"
            >
              <span className="truncate">{monitor.url}</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            </a>
          </div>
        </div>

        <div className="relative ml-4" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-gray-200 dark:border-primary-700 z-50">
              <Link
                to={`/monitor/${monitor._id}`}
                className="block px-4 py-2 text-responsive-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 rounded-t-lg"
                onClick={() => setShowMenu(false)}
              >
                View Details
              </Link>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-responsive-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-b-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <StatusBadge status={monitor.status} />
        <div className="text-right">
          <div className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100">
            {monitor.uptime.toFixed(1)}%
          </div>
          <div className="text-responsive-xs text-gray-500 dark:text-gray-400">uptime</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-primary-800">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          <div>
            <div className="text-responsive-xs text-gray-500 dark:text-gray-400">Interval</div>
            <div className="text-responsive-sm font-medium text-gray-900 dark:text-gray-100">
              {formatInterval(monitor.interval)}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          <div>
            <div className="text-responsive-xs text-gray-500 dark:text-gray-400">Last Check</div>
            <div className="text-responsive-sm font-medium text-gray-900 dark:text-gray-100">
              {formatLastChecked(monitor.lastChecked)}
            </div>
          </div>
        </div>
      </div>

      {/* Total Checks */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-primary-800">
        <div className="text-responsive-xs text-gray-500 dark:text-gray-400 mb-1">
          Total Checks: {monitor.totalChecks} | Successful: {monitor.successfulChecks}
        </div>
        <div className="w-full bg-gray-200 dark:bg-primary-800 rounded-full h-2">
          <div
            className="bg-success-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${monitor.uptime}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonitorCard;

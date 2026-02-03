import React, { useState } from 'react';
import { X, Globe, Clock, Timer } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const AddMonitorModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval: 300000, // 5 minutes
    timeout: 10000 // 10 seconds
  });
  const [loading, setLoading] = useState(false);

  const intervalOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' }
  ];

  const timeoutOptions = [
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 15000, label: '15 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'interval' || name === 'timeout' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd(formData);
    } catch (error) {
      console.error('Add monitor error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    let url = e.target.value;

    // Auto-add https:// if no protocol is specified
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setFormData({
      ...formData,
      url,
      // Auto-generate name from URL if name is empty
      name: formData.name || url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-primary-800">
          <h2 className="text-responsive-lg font-semibold text-gray-900 dark:text-gray-100">
            Add New Monitor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monitor Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input pl-10"
                placeholder="My Website"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="url"
                name="url"
                required
                className="input pl-10"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleUrlChange}
              />
            </div>
            <p className="mt-1 text-responsive-xs text-gray-500 dark:text-gray-400">
              The URL will be checked for availability
            </p>
          </div>

          {/* Check Interval */}
          <div>
            <label htmlFor="interval" className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check Interval
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="interval"
                name="interval"
                className="input pl-10"
                value={formData.interval}
                onChange={handleChange}
              >
                {intervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-responsive-xs text-gray-500 dark:text-gray-400">
              How often to check your website
            </p>
          </div>

          {/* Timeout */}
          <div>
            <label htmlFor="timeout" className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Timeout
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Timer className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="timeout"
                name="timeout"
                className="input pl-10"
                value={formData.timeout}
                onChange={handleChange}
              >
                {timeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-responsive-xs text-gray-500 dark:text-gray-400">
              Maximum time to wait for a response
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Add Monitor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonitorModal;

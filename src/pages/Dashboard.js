import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { Plus, Monitor, TrendingUp, AlertCircle, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';
import AddMonitorModal from '../components/Monitors/AddMonitorModal';
import MonitorCard from '../components/Monitors/MonitorCard';
import SecuritySettings from '../components/Settings/SecuritySettings';

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { socket, connected } = useSocket();
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    avgUptime: 0
  });

  useEffect(() => {
    fetchMonitors();
  }, []);

  // Listen for real-time monitor updates
  useEffect(() => {
    if (!socket) return;

    const handleMonitorUpdate = (data) => {
      console.log('📡 Real-time update received:', data);

      // Update the specific monitor in the list
      setMonitors(prevMonitors => {
        const updatedMonitors = prevMonitors.map(monitor => {
          if (monitor._id === data.monitorId) {
            return {
              ...monitor,
              status: data.status,
              uptime: data.uptime,
              lastChecked: data.timestamp
            };
          }
          return monitor;
        });

        // Recalculate stats with updated monitors
        calculateStats(updatedMonitors);

        return updatedMonitors;
      });

      // Show toast notification for status changes
      const monitorName = monitors.find(m => m._id === data.monitorId)?.name || 'Monitor';
      if (data.status === 'down') {
        toast.error(`${monitorName} is down!`, {
          icon: '🔴',
          duration: 4000,
        });
      } else if (data.status === 'up') {
        toast.success(`${monitorName} is back online!`, {
          icon: '🟢',
          duration: 3000,
        });
      }
    };

    socket.on('monitorUpdate', handleMonitorUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('monitorUpdate', handleMonitorUpdate);
    };
  }, [socket, monitors]);

  const fetchMonitors = async () => {
    try {
      const response = await api.get('/api/monitors');
      setMonitors(response.data.monitors);
      calculateStats(response.data.monitors);
    } catch (error) {
      toast.error('Failed to fetch monitors');
      console.error('Fetch monitors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (monitorsList) => {
    const total = monitorsList.length;
    const online = monitorsList.filter(m => m.status === 'up').length;
    const offline = monitorsList.filter(m => m.status === 'down').length;
    const avgUptime = total > 0
      ? monitorsList.reduce((sum, m) => sum + m.uptime, 0) / total
      : 0;

    setStats({ total, online, offline, avgUptime });
  };

  const handleAddMonitor = async (monitorData) => {
    try {
      const response = await api.post('/api/monitors', monitorData);
      setMonitors([response.data.monitor, ...monitors]);
      calculateStats([response.data.monitor, ...monitors]);
      setShowAddModal(false);
      toast.success('Monitor added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add monitor');
    }
  };

  const handleDeleteMonitor = async (monitorId) => {
    try {
      await api.delete(`/api/monitors/${monitorId}`);
      const updatedMonitors = monitors.filter(m => m._id !== monitorId);
      setMonitors(updatedMonitors);
      calculateStats(updatedMonitors);
      toast.success('Monitor deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete monitor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Dashboard
              </h1>
              <p className="text-responsive-base text-gray-600 dark:text-gray-400">
                Monitor your websites and track their uptime performance
              </p>
            </div>
            {/* Real-time connection status */}
            <div className="flex items-center space-x-2">
              {connected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500 animate-pulse" />
                  <span className="text-sm text-green-600 hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <Wifi className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-400 hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">Total Monitors</p>
                <p className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-responsive-xl font-bold text-success-600 dark:text-success-400">{stats.online}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">Offline</p>
                <p className="text-responsive-xl font-bold text-danger-600 dark:text-danger-400">{stats.offline}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">Avg Uptime</p>
                <p className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.avgUptime.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="mb-8">
          <SecuritySettings />
        </div>

        {/* Monitors Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-responsive-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
            Your Monitors
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </button>
        </div>

        {/* Monitors Grid */}
        {monitors.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <Monitor className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-responsive-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No monitors yet
            </h3>
            <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first website to monitor
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Monitor
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor._id}
                monitor={monitor}
                onDelete={handleDeleteMonitor}
              />
            ))}
          </div>
        )}

        {/* Add Monitor Modal */}
        {showAddModal && (
          <AddMonitorModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddMonitor}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

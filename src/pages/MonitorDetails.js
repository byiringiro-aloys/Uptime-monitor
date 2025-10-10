import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Activity,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';

const MonitorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  const periods = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  useEffect(() => {
    fetchMonitorDetails();
  }, [id]);

  useEffect(() => {
    if (monitor) {
      fetchMonitorStats();
    }
  }, [monitor, selectedPeriod]);

  const fetchMonitorDetails = async () => {
    try {
      const response = await api.get(`/api/monitors/${id}`);
      setMonitor(response.data.monitor);
      setRecentLogs(response.data.recentLogs);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Monitor not found');
        navigate('/dashboard');
      } else {
        toast.error('Failed to fetch monitor details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitorStats = async () => {
    try {
      const response = await api.get(`/api/monitors/${id}/stats?period=${selectedPeriod}`);
      setStats(response.data.stats);
      setChartData(response.data.chartData);
    } catch (error) {
      console.error('Failed to fetch monitor stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-responsive-lg font-medium text-gray-900 mb-2">
            Monitor not found
          </h2>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900 mb-2">
                {monitor.name}
              </h1>
              <div className="flex items-center space-x-4">
                <a
                  href={monitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <span className="text-responsive-base">{monitor.url}</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
                <StatusBadge status={monitor.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-responsive-sm text-gray-600">Uptime</p>
                  <p className="text-responsive-xl font-bold text-gray-900">
                    {stats.uptime}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-responsive-sm text-gray-600">Successful</p>
                  <p className="text-responsive-xl font-bold text-success-600">
                    {stats.successfulPings}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-responsive-sm text-gray-600">Avg Response</p>
                  <p className="text-responsive-xl font-bold text-gray-900">
                    {stats.avgResponseTime}ms
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-responsive-sm text-gray-600">Total Checks</p>
                  <p className="text-responsive-xl font-bold text-gray-900">
                    {stats.totalPings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4 sm:mb-0">
              Uptime Chart
            </h2>
            <div className="flex space-x-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 rounded-lg text-responsive-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Uptime']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No data available for the selected period</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-responsive-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h2>
          
          {recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.slice(0, 10).map((log, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-success-500' : 'bg-danger-500'
                    }`} />
                    <div>
                      <p className="text-responsive-sm font-medium text-gray-900">
                        {log.status === 'success' ? 'Check successful' : 'Check failed'}
                      </p>
                      <p className="text-responsive-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {log.status === 'success' ? (
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-900">
                          {log.responseTime}ms
                        </p>
                        <p className="text-responsive-xs text-gray-500">
                          HTTP {log.statusCode}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-responsive-sm font-medium text-danger-600">
                          Failed
                        </p>
                        <p className="text-responsive-xs text-gray-500">
                          {log.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorDetails;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  Shield,
  BarChart3,
  Bell,
  Clock,
  Globe,
  Zap,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Monitor your websites 24/7 with customizable check intervals'
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Get notified immediately when your site goes down'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'View uptime statistics, response times, and historical data'
    },
    {
      icon: Shield,
      title: 'Reliable Service',
      description: 'Built with redundancy and reliability in mind'
    }
  ];

  const stats = [
    { label: 'Websites Monitored', value: '10,000+' },
    { label: 'Uptime Guarantee', value: '99.9%' },
    { label: 'Average Response Time', value: '<1s' },
    { label: 'Global Locations', value: '15+' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-primary-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary-600 rounded-full">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-responsive-3xl font-bold text-gray-900 dark:text-white mb-6">
              Monitor Your Website Uptime
              <br />
              <span className="text-primary-600 dark:text-primary-400">Like Never Before</span>
            </h1>

            <p className="text-responsive-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Keep track of your website's availability with real-time monitoring,
              instant alerts, and detailed analytics. Get peace of mind knowing
              your site is always up and running.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-responsive-base px-8 py-3">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-responsive-base px-8 py-3">
                    Start Monitoring Free
                  </Link>
                  <Link to="/login" className="btn-secondary text-responsive-base px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-responsive-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-responsive-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Monitor Your Sites
            </h2>
            <p className="text-responsive-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive monitoring solution provides all the tools you need
              to keep your websites running smoothly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-responsive-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started with website monitoring in just three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-600 rounded-full text-white font-bold text-xl">
                  1
                </div>
              </div>
              <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white mb-3">
                Add Your Website
              </h3>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
                Simply enter your website URL and configure monitoring settings.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-600 rounded-full text-white font-bold text-xl">
                  2
                </div>
              </div>
              <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white mb-3">
                We Monitor 24/7
              </h3>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
                Our system continuously checks your website's availability and performance.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-600 rounded-full text-white font-bold text-xl">
                  3
                </div>
              </div>
              <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white mb-3">
                Get Instant Alerts
              </h3>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
                Receive immediate notifications when issues are detected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-responsive-2xl font-bold text-white mb-4">
            Ready to Start Monitoring?
          </h2>
          <p className="text-responsive-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of website owners who trust our monitoring service
            to keep their sites running smoothly.
          </p>

          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-white dark:bg-primary-900 text-primary-600 dark:text-white font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-primary-800 transition-colors text-responsive-base"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Start Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

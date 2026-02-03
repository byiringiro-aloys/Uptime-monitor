import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Password reset instructions sent!');
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to send reset email';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-950 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center">
                            <div className="p-3 bg-green-600 rounded-full">
                                <Activity className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="mt-6 text-responsive-2xl font-bold text-gray-900 dark:text-gray-100">
                            Check Your Email
                        </h2>
                        <p className="mt-2 text-responsive-base text-gray-600 dark:text-gray-400">
                            If your email is registered, you will receive a password reset link shortly.
                        </p>
                        <p className="mt-4 text-responsive-sm text-gray-500 dark:text-gray-500">
                            Don't see the email? Check your spam folder.
                        </p>
                    </div>

                    <div className="mt-8">
                        <Link
                            to="/login"
                            className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-950 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary-600 rounded-full">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-responsive-2xl font-bold text-gray-900 dark:text-gray-100">
                        Forgot Password?
                    </h2>
                    <p className="mt-2 text-responsive-sm text-gray-600 dark:text-gray-400">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input pl-10"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-responsive-base flex items-center justify-center"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-responsive-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await api.get(`/api/auth/verify-email/${token}`);
                setStatus('success');
                toast.success('Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.error || 'Verification failed. Token might be invalid or expired.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-950 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-primary-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-primary-800">

                {status === 'verifying' && (
                    <div className="text-center">
                        <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            Verifying your email...
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Please wait while we verify your account.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            Email Verified!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Your account has been successfully verified. You can now log in to access your dashboard.
                        </p>
                        <div className="mt-8">
                            <Link to="/login" className="btn-primary w-full flex items-center justify-center">
                                Continue to Login
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            Verification Failed
                        </h2>
                        <p className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg">
                            {error}
                        </p>
                        <div className="mt-8">
                            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;

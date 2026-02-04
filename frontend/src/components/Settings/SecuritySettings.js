import React, { useState, useEffect } from 'react';
import { Shield, Settings, Check, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import TwoFactorSetup from '../Auth/TwoFactorSetup';
import LoadingSpinner from '../UI/LoadingSpinner';

const SecuritySettings = () => {
    const [twoFactorStatus, setTwoFactorStatus] = useState({
        twoFactorEnabled: false,
        twoFactorAlwaysRequired: false,
        trustedDevicesCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disabling, setDisabling] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/api/auth/2fa/status');
            setTwoFactorStatus(response.data);
        } catch (error) {
            toast.error('Failed to fetch 2FA status');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAlwaysRequired = async () => {
        try {
            const response = await api.post('/api/auth/2fa/toggle-always-required');
            setTwoFactorStatus(prev => ({
                ...prev,
                twoFactorAlwaysRequired: response.data.twoFactorAlwaysRequired
            }));
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update setting');
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();

        if (!disablePassword) {
            toast.error('Please enter your password');
            return;
        }

        setDisabling(true);
        try {
            await api.post('/api/auth/2fa/disable', { password: disablePassword });
            setTwoFactorStatus({
                twoFactorEnabled: false,
                twoFactorAlwaysRequired: false,
                trustedDevicesCount: 0
            });
            setShowDisableConfirm(false);
            setDisablePassword('');
            toast.success('2FA disabled successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to disable 2FA');
        } finally {
            setDisabling(false);
        }
    };

    const handleSetupComplete = () => {
        setTwoFactorStatus(prev => ({
            ...prev,
            twoFactorEnabled: true
        }));
    };

    if (loading) {
        return (
            <div className="card p-6">
                <div className="flex justify-center">
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card p-6">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                        <p className="text-sm text-gray-600">Manage your account security preferences</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 2FA Status */}
                    <div className="flex items-start justify-between pb-6 border-b">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                {twoFactorStatus.twoFactorEnabled ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Check className="h-3 w-3 mr-1" />
                                        Enabled
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        <X className="h-3 w-3 mr-1" />
                                        Disabled
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                {twoFactorStatus.twoFactorEnabled
                                    ? 'Your account is protected with two-factor authentication. You\'ll be asked for a verification code when logging in from new devices.'
                                    : 'Add an extra layer of security to your account by enabling two-factor authentication.'
                                }
                            </p>
                        </div>
                        <div className="ml-4">
                            {twoFactorStatus.twoFactorEnabled ? (
                                <button
                                    onClick={() => setShowDisableConfirm(true)}
                                    className="btn-secondary text-sm"
                                >
                                    Disable
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSetupModal(true)}
                                    className="btn-primary text-sm"
                                >
                                    Enable 2FA
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Always Require 2FA */}
                    {twoFactorStatus.twoFactorEnabled && (
                        <div className="flex items-start justify-between pb-6 border-b">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">Always Require 2FA</h4>
                                <p className="text-sm text-gray-600">
                                    Require 2FA code on every login, regardless of device trust status.
                                    By default, 2FA is only required for suspicious activity.
                                </p>
                            </div>
                            <div className="ml-4">
                                <button
                                    onClick={handleToggleAlwaysRequired}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${twoFactorStatus.twoFactorAlwaysRequired ? 'bg-primary-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorStatus.twoFactorAlwaysRequired ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trusted Devices */}
                    {twoFactorStatus.twoFactorEnabled && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Trusted Devices</h4>
                            <p className="text-sm text-gray-600">
                                You have <strong>{twoFactorStatus.trustedDevicesCount}</strong> trusted device
                                {twoFactorStatus.trustedDevicesCount !== 1 ? 's' : ''}.
                                These devices won't require 2FA verification when logging in.
                            </p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex">
                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div className="ml-3">
                                <h5 className="text-sm font-medium text-blue-900 mb-1">
                                    Dynamic 2FA Protection
                                </h5>
                                <p className="text-xs text-blue-800">
                                    Our system automatically detects suspicious activity (new devices, new locations,
                                    unusual patterns) and requires 2FA verification when needed, even if you haven't
                                    enabled "Always Require 2FA".
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disable 2FA Confirmation Modal */}
            {showDisableConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <Lock className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900">
                                Disable Two-Factor Authentication
                            </h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to disable 2FA? Your account will be less secure.
                            Please enter your password to confirm.
                        </p>

                        <form onSubmit={handleDisable2FA} className="space-y-4">
                            <div>
                                <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="disable-password"
                                    type="password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    className="input"
                                    placeholder="Enter your password"
                                    required
                                    disabled={disabling}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDisableConfirm(false);
                                        setDisablePassword('');
                                    }}
                                    className="flex-1 btn-secondary py-2"
                                    disabled={disabling}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                                    disabled={disabling}
                                >
                                    {disabling ? <LoadingSpinner size="sm" /> : 'Disable 2FA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            <TwoFactorSetup
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                onSetupComplete={handleSetupComplete}
            />
        </>
    );
};

export default SecuritySettings;

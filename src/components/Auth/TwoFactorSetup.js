import React, { useState, useEffect } from 'react';
import { X, Shield, QrCode, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import LoadingSpinner from '../UI/LoadingSpinner';

const TwoFactorSetup = ({ isOpen, onClose, onSetupComplete }) => {
    const [step, setStep] = useState(1); // 1: QR Code, 2: Verify
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setupTwoFactor();
        }
    }, [isOpen]);

    const setupTwoFactor = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/2fa/setup');
            setQrCode(response.data.qrCode);
            setSecret(response.data.secret);
            setStep(1);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to setup 2FA');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        toast.success('Secret copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 6);
        setCode(value);
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (code.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/2fa/verify-setup', { code });
            toast.success('2FA enabled successfully!');
            onSetupComplete();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <Shield className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Enable Two-Factor Authentication
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? 'Scan the QR code with your authenticator app'
                            : 'Enter the verification code to complete setup'
                        }
                    </p>
                </div>

                {loading && step === 1 ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <div className="space-y-4">
                                {/* QR Code */}
                                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                    {qrCode ? (
                                        <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                                    ) : (
                                        <QrCode className="h-64 w-64 text-gray-300" />
                                    )}
                                </div>

                                {/* Manual Entry */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-2">
                                        Can't scan the QR code?
                                    </p>
                                    <p className="text-xs text-blue-800 mb-2">
                                        Enter this code manually:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-white rounded text-sm font-mono break-all">
                                            {secret}
                                        </code>
                                        <button
                                            onClick={handleCopySecret}
                                            className="p-2 hover:bg-blue-100 rounded transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <Check className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Copy className="h-5 w-5 text-blue-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Supported Apps */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        Recommended Authenticator Apps:
                                    </p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Google Authenticator</li>
                                        <li>• Microsoft Authenticator</li>
                                        <li>• Authy</li>
                                        <li>• 1Password</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full btn-primary py-3"
                                >
                                    Continue to Verification
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={code}
                                        onChange={handleCodeChange}
                                        placeholder="000000"
                                        className="input text-center text-2xl tracking-widest font-mono"
                                        autoFocus
                                        disabled={loading}
                                    />
                                </div>

                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        ⚠️ <strong>Important:</strong> Make sure to save your backup codes or
                                        keep access to your authenticator app. You'll need it to sign in.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 btn-secondary py-2"
                                        disabled={loading}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary py-2 flex items-center justify-center"
                                        disabled={loading || code.length !== 6}
                                    >
                                        {loading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            'Enable 2FA'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TwoFactorSetup;

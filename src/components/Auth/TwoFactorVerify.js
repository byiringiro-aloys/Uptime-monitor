import React, { useState } from 'react';
import { X, Shield, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TwoFactorVerify = ({ tempToken, onVerified, onCancel }) => {
    const [code, setCode] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 6);
        setCode(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (code.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await onVerified(code, trustDevice);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary-100 rounded-full">
                            <Shield className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Two-Factor Authentication
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
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

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="trust-device"
                                type="checkbox"
                                checked={trustDevice}
                                onChange={(e) => setTrustDevice(e.target.checked)}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                disabled={loading}
                            />
                        </div>
                        <div className="ml-3">
                            <label htmlFor="trust-device" className="text-sm text-gray-700">
                                Trust this device for 30 days
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 btn-secondary py-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-2 flex items-center justify-center"
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? (
                                <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> This verification is required because we detected unusual activity
                        (new device, location, or long inactivity).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerify;

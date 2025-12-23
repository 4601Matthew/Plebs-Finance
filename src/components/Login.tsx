import { useState } from 'react';
import { Lock } from 'lucide-react';
import { api } from '../api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.verifyPin(pin);
      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Invalid PIN');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Plebs Finance
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your PIN to continue
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest mb-4"
            maxLength={6}
            autoFocus
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          {pin.length === 0 && 'Enter a 4-6 digit PIN to get started'}
        </p>
      </div>
    </div>
  );
}


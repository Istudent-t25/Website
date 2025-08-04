import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('تکایە ئیمەیڵ و وشەی نهێنی داخڵ بکە.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://134.209.212.209:8000/auth/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'student',
          'X-Request-Source': 'web',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

          if (response.ok) {
        if (onLoginSuccess) {
          onLoginSuccess({
            accessToken: data.access_token,
          });
        }

      } else {
        setError(data.detail || 'هەڵەی چونەژوورەوە. تکایە زانیارییەکانت بپشکنە.');
      }
    } catch (apiError) {
      console.error(apiError);
      setError("کێشەیەک ڕوویدا لە کاتی چونەژوورەوەدا. تکایە دووبارە هەوڵبدەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative" dir="rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition"
          disabled={loading}
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">چونەژوورەوە</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-right" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1 text-right">ئیمەیڵ</label>
            <input
              type="email"
              id="loginEmail"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-right"
              placeholder="ئیمەیڵەکەت داخڵ بکە"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              dir="rtl"
            />
          </div>
          <div>
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1 text-right">وشەی نهێنی</label>
            <input
              type="password"
              id="loginPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-right"
              placeholder="وشەی نهێنیت داخڵ بکە"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              dir="rtl"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md mt-6"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <LogIn size={20} />
            )}
            {loading ? 'چاوەڕوان بە...' : 'چونەژوورەوە'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          هەژمارت نییە؟{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline font-medium"
            disabled={loading}
          >
            خۆت تۆمار بکە
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  // ------------------- SIGN UP -------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = crypto.getRandomValues(new Uint8Array(16));
    const pbkdf2Salt = Buffer.from(s).toString('base64');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, pbkdf2Salt }),
    });

    if (res.ok) {
      alert('Signup successful! Redirecting to your vault...');
      location.href = '/vault'; // ✅ Directly redirect to vault
    } else {
      alert('Signup failed. Try again.');
    }
  };

  // ------------------- LOGIN -------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requires2FA && totp) {
      // ✅ FIXED 2FA VERIFY CALL
      const res = await fetch('/api/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('jwt') || ''}`,
        },
        body: JSON.stringify({ token: totp }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        alert('2FA verified! Redirecting...');
        sessionStorage.setItem('jwt', data.token || '');
        location.href = '/vault';
      } else {
        setMessage(data.error || 'Invalid 2FA code');
      }
    } else {
      // Normal login
      const res = await signIn('credentials', { redirect: false, email, password });
      if (res && res.ok) {
        const r = await fetch('/api/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const d = await r.json();
        if (d.requires2FA) {
          setRequires2FA(true);
        } else {
          sessionStorage.setItem('jwt', d.token || '');
          location.href = '/vault';
        }
      } else {
        alert('Login failed. Please check credentials.');
      }
    }
  };

  // ------------------- SETUP 2FA -------------------
  const handleSetup2FA = async () => {
    if (!email) {
      alert('Enter your email first!');
      return;
    }

    const totpRes = await fetch('/api/totp/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await totpRes.json();
    if (totpRes.ok) {
      setQrCode(data.qr);
      setVerifying2FA(true);
      alert('Scan this QR code and verify with your 6-digit code.');
    } else {
      alert('Failed to setup 2FA.');
    }
  };

  // ------------------- VERIFY 2FA AFTER SCAN -------------------
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ FIXED 2FA VERIFY CALL
    const res = await fetch('/api/totp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('jwt') || ''}`,
      },
      body: JSON.stringify({ token: totp }),
    });

    const data = await res.json();
    if (res.ok && data.verified) {
      alert('2FA setup complete! Redirecting to your vault...');
      sessionStorage.setItem('jwt', data.token || '');
      location.href = '/vault';
    } else {
      setMessage(data.error || 'Invalid code, please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          Password Vault
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
          <button
            className={`flex-1 py-2 font-medium text-center ${
              tab === 'signup'
                ? 'border-b-4 border-green-500 text-green-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => {
              setTab('signup');
              setVerifying2FA(false);
            }}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-2 font-medium text-center ${
              tab === 'login'
                ? 'border-b-4 border-blue-500 text-blue-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => {
              setTab('login');
              setVerifying2FA(false);
            }}
          >
            Log In
          </button>
        </div>

        {/* SIGN UP FORM */}
        {!verifying2FA && tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <button className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
              Sign Up
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {!verifying2FA && tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {requires2FA && (
              <input
                type="text"
                placeholder="Enter 2FA code"
                value={totp}
                onChange={e => setTotp(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                required
              />
            )}
            {message && <p className="text-red-500 text-sm">{message}</p>}
            <div className="flex flex-col gap-3">
              <button className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                {requires2FA ? 'Verify 2FA & Log In' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={handleSetup2FA}
                className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
              >
                Setup 2FA
              </button>
            </div>
          </form>
        )}

        {/* 2FA VERIFY SCREEN */}
        {verifying2FA && (
          <form onSubmit={handleVerify2FA} className="space-y-4 text-center">
            <p className="text-gray-700 dark:text-gray-200">
              Scan this QR code with Google Authenticator and enter your 6-digit code.
            </p>
            {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48 mb-4" />}
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={totp}
              onChange={e => setTotp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {message && <p className="text-red-500 text-sm">{message}</p>}
            <button className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
              Verify 2FA
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 
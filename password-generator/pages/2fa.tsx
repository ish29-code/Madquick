import { useEffect, useState } from 'react';

export default function TwoFA() {
  const [qrUrl, setQrUrl] = useState('');
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTOTP = async () => {
    const jwt = sessionStorage.getItem('jwt');
    if (!jwt) {
      setMessage('You must log in first!');
      return;
    }

    try {
      const res = await fetch('/api/totp/setup', {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });

      if (res.ok) {
        const data = await res.json();
        setQrUrl(data.qr); // base64 QR image from backend
      } else {
        setMessage('Failed to fetch 2FA setup info.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error connecting to server.');
    }
  };

  useEffect(() => {
    fetchTOTP();
  }, []);

  const handleVerify = async () => {
    const jwt = sessionStorage.getItem('jwt');
    if (!jwt) {
      setMessage('You must log in first!');
      return;
    }

    try {
      const res = await fetch('/api/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setVerified(true);
        setMessage('2FA enabled successfully!');
      } else {
        setMessage(data.error || 'Invalid token. Try again.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error during verification.');
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">2FA Enabled ✅</h1>
        <p className="text-gray-700">You have successfully enabled two-factor authentication.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Setup Two-Factor Authentication</h1>

      {qrUrl ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 w-[320px]">
          <img src={qrUrl} alt="2FA QR Code" className="w-48 h-48" />

          <input
            type="text"
            placeholder="Enter token from your authenticator app"
            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Verify & Enable 2FA
          </button>
        </div>
      ) : (
        <p>Loading QR code...</p>
      )}

      {message && <p className="text-red-500 mt-4">{message}</p>}
    </div>
  );
}

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { authenticator } from 'otplib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, token } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const client = await clientPromise;
    const db = client.db('vaultdb');
    const user = await db.collection('users').findOne({ email });

    if (!user) return res.status(401).json({ error: 'User not found' });

    // TODO: verify password with pbkdf2Salt + hash
    const passwordCorrect = password === user.password; // replace with hashing check
    if (!passwordCorrect) return res.status(401).json({ error: 'Invalid password' });

    // If user has TOTP enabled, check token
    if (user.totp?.enabled) {
      if (!token) return res.status(200).json({ requires2FA: true }); // prompt for 2FA

      const isValid = authenticator.check(token, user.totp.secret);
      if (!isValid) return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    // Return session token
    res.status(200).json({ requires2FA: false, token: 'fake-jwt-token' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

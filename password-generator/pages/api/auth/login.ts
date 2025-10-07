import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, token } = req.body;
  const client = await clientPromise;
  const db = client.db('vaultdb');

  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

  // If 2FA enabled
  if (user.totp?.enabled) {
    if (!token) {
      // No token provided yet
      return res.status(200).json({ requires2FA: true });
    }
    const isValid = authenticator.check(token, user.totp.secret);
    if (!isValid) return res.status(400).json({ error: 'Invalid 2FA token' });
  }

  // All good → generate session / JWT
  const jwtToken = 'YOUR_JWT_OR_SESSION'; // replace with actual token
  res.status(200).json({ token: jwtToken, message: 'Login successful' });
}

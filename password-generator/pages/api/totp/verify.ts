import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';
import clientPromise from '../../../lib/mongodb';
import { parseUserFromReq } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = parseUserFromReq(req as any);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const client = await clientPromise;
    const db = client.db('vaultdb');

    const u = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    if (!u || !u.totp?.secret) return res.status(400).json({ error: 'TOTP not set up' });

    const isValid = authenticator.check(token, u.totp.secret);
    if (!isValid) return res.status(400).json({ error: 'Invalid token' });

    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { $set: { 'totp.enabled': true } }
    );

    res.status(200).json({ verified: true });
  } catch (err) {
    console.error('TOTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify TOTP' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const client = await clientPromise;
  const db = client.db('vaultdb');

  const existing = await db.collection('users').findOne({ email });
  if (existing) return res.status(409).json({ error: 'User exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const pbkdf2Salt = crypto.getRandomValues(new Uint8Array(16)).toString(); // optional for AES

  const result = await db.collection('users').insertOne({
    email, passwordHash, pbkdf2Salt, createdAt: new Date()
  });

  const token = signToken({ id: result.insertedId.toString(), email });
  setTokenCookie(res, token);

  res.status(201).json({ ok: true });
}




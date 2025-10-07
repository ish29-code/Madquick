import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { parseUserFromReq } from '../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = parseUserFromReq(req as any);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const client = await clientPromise;
  const db = client.db('vaultdb');

  try {
    if (req.method === 'GET') {
      const items = await db
        .collection('vault')
        .find({ userId: user.id })
        .toArray();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { title, username, password, url, notes } = req.body;
      const encryptedPassword = password; // already encrypted on client
      const result = await db.collection('vault').insertOne({
        userId: user.id,
        title,
        username,
        password: encryptedPassword,
        url,
        notes,
        createdAt: new Date(),
      });
      return res.status(201).json({ ok: true, id: result.insertedId });
    }

    if (req.method === 'PUT') {
      const { id, title, username, password, url, notes } = req.body;
      await db.collection('vault').updateOne(
        { _id: new ObjectId(id), userId: user.id },
        { $set: { title, username, password, url, notes } }
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await db.collection('vault').deleteOne({ _id: new ObjectId(id), userId: user.id });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('Vault API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

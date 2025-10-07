/*import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb'; // two levels up from /usr
import { parseUserFromReq } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate user
    const user = parseUserFromReq(req as any);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('vaultdb');

    // Fetch user document
    const u = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    if (!u) return res.status(404).json({ error: 'User not found' });

    // Return PBKDF2 salt and TOTP status
    return res.status(200).json({
      pbkdf2Salt: u.pbkdf2Salt || null,
      totpEnabled: !!u.totp?.enabled,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}*/

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { parseUserFromReq } from '../../../lib/auth';
import { ObjectId } from 'mongodb'; // ✅ Import ObjectId properly

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = parseUserFromReq(req as any);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const client = await clientPromise;
    const db = client.db('vaultdb');

    // ✅ Use new ObjectId
    const u = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    if (!u) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ pbkdf2Salt: u.pbkdf2Salt || null, totpEnabled: !!u.totp?.enabled });
  } catch (err) {
    console.error('Error in /api/user/salt:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}




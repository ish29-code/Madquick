/*import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import clientPromise from '../../../lib/mongodb';
import { parseUserFromReq } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = parseUserFromReq(req as any);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'MyVaultApp', secret);
    const qr = await QRCode.toDataURL(otpauthUrl);

    const client = await clientPromise;
    const db = client.db('vaultdb');

    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { $set: { 'totp.secret': secret, 'totp.enabled': false } }
    );

    res.status(200).json({ qr, secret }); // ✅ returns base64 QR image + secret
  } catch (err) {
    console.error('TOTP setup error:', err);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
}
*/
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import clientPromise from '../../../lib/mongodb';
import { parseUserFromReq } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = parseUserFromReq(req as any);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const client = await clientPromise;
    const db = client.db('vaultdb');

    let u = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    let secret = u?.totp?.secret;

    if (!secret) {
      secret = authenticator.generateSecret();
      await db.collection('users').updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { 'totp.secret': secret, 'totp.enabled': false } }
      );
    }

    const otpauthUrl = authenticator.keyuri(user.email, 'MyVaultApp', secret);
    const qr = await QRCode.toDataURL(otpauthUrl);

    res.status(200).json({ qr, secret });
  } catch (err) {
    console.error('TOTP setup error:', err);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
}


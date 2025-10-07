// lib/auth.ts
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import type { NextApiRequest } from 'next';

const TOKEN_NAME = 'token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Sign JWT token
export function signToken(payload: object) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET not set');
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET, { expiresIn: MAX_AGE });
}

// Set token as HttpOnly cookie
export function setTokenCookie(res: any, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  res.setHeader('Set-Cookie', cookie);
}

// Parse token from request cookies
export function parseUserFromReq(req: NextApiRequest) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[TOKEN_NAME];
  if (!token) return null;

  try {
    if (!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET not set');
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded as any; // { id, email, ... }
  } catch (err) {
    return null;
  }
}

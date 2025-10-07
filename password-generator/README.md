# Password Generator + Secure Vault (Starter)

Features:
- Next.js + TypeScript + Tailwind (dark mode)
- NextAuth (email/password via credentials) + MongoDB
- TOTP 2FA (speakeasy + QR codes)
- Client-side encryption: PBKDF2 -> AES-GCM
- Password generator, vault CRUD (encrypted)

Quick start:
1. cp .env.example .env and fill values (MONGODB_URI, NEXTAUTH_SECRET)
2. npm install
3. npm run dev

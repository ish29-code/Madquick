/*import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise as any),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null

          const client = await clientPromise
          const db = client.db('vaultdb')
          const user = await db.collection('users').findOne({ email: credentials.email })
          if (!user) return null

          const ok = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!ok) return null

          // Include pbkdf2Salt in returned user
          return { id: user._id.toString(), email: user.email, pbkdf2Salt: user.pbkdf2Salt }
        } catch (err) {
          console.error('NextAuth authorize error:', err)
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user
      return token
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user = token.user
      return session
    }
  }
})
*/
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: { type: 'text' }, password: { type: 'password' } },
      async authorize(credentials) {
        if (!credentials) return null;
        const client = await clientPromise;
        const db = client.db('vaultdb');
        const user = await db.collection('users').findOne({ email: credentials.email });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user._id.toString(), email: user.email, pbkdf2Salt: user.pbkdf2Salt };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user = token.user;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});

import NextAuth from 'next-auth';
import OsuProvider from 'next-auth/providers/osu';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { cert } from 'firebase-admin/app';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

export const authOptions = {
  providers: [
    OsuProvider({
      clientId: process.env.OSU_CLIENT_ID,
      clientSecret: process.env.OSU_CLIENT_SECRET,
    }),
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    namingStrategy: 'snake_case',
  }),
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account) {
        token.accessToken = account.access_token;
        token.osuId = profile.id;
        token.countryCode = profile.country_code;
      }

      return token;
    },
    async session({ session, token, user }) {
      session.user.id = token.osuId;
      session.user.country_code = token.countryCode;
      session.user.country_flag = `https://osu.ppy.sh/images/flags/${token.countryCode}.png`;
      return session;
    },
    // ...other callbacks
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 5 * 60 * 1000,
  },
  // Customize any built-in NextAuth pages here
  //pages: {},
};

export default NextAuth(authOptions);

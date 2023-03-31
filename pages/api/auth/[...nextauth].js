import NextAuth from "next-auth";
import OsuProvider from "next-auth/providers/osu";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const osuConfig = OsuProvider({
  clientId: process.env.OSU_CLIENT_ID,
  clientSecret: process.env.OSU_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      email: null,
      name: profile.username,
      image: profile.avatar_url,
      country: profile.country.code,
    };
  },
});

export const authOptions = {
  providers: [osuConfig],
  session: { strategy: "jwt" },
  callbacks: {
    // Check for and apply user updates on sign in to the database
    async signIn(user) {
      console.log("Starting sign in callback...");
      if (user) {
        console.log("Returning user...");

        // Extract the relevant data from the profile object
        const newUser = {
          name: user.profile.username,
          image: user.profile.avatar_url,
          country: user.profile.country.code,
        };

        const changed = (currentData, newData) => {
          console.log("Checking if user data changed...");
          for (const key in newData) {
            if (
              newData.hasOwnProperty(key) &&
              currentData.hasOwnProperty(key)
            ) {
              if (currentData[key] !== newData[key]) {
                return true;
              }
            }
          }
          console.log("User data unchanged, skipping update...");
          return false;
        };

        // Update the user data in the database using Prisma
        if (changed(user.user, newUser)) {
          console.log("User data changed, updating...");
          await prisma.user.update({
            where: { id: user.user.id },
            data: newUser,
          });
        }
      }
      return true;
    },
    // JSON Web Token stores a payload in the browser's cookies (if using JWT)
    // This callback is called at sign in (created): user, account, profile, isNewUser is passed
    // Or when updated (client accesses session): token is only passed
    async jwt({ token, user, account, profile, isNewUser }) {
      //on sign in
      if (user && account) {
        token.accessToken = account.access_token;
      }
      //on session access
      return token;
    },
    async session({ session, token, user }) {
      return session;
    },
  },
  events: {
    async signIn(message) {
      console.log("Sign in: ", message.user.name);
    },
    async signOut(message) {
      console.log("Sign out: ", message.token.name);
    },
    async createUser(message) {
      console.log("Create User: ", message);
    },
    async linkAccount(message) {
      console.log("Link Account: ", message);
    },
    async session(message) {
      console.log("Session Active");
    },
  },
  adapter: PrismaAdapter(prisma),
};

export default NextAuth(authOptions);

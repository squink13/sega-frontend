import { XataClient } from "@/xata";
import { XataAdapter } from "@next-auth/xata-adapter";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import OsuProvider from "next-auth/providers/osu";

const xata = new XataClient();

const osuConfig = OsuProvider({
  clientId: process.env.OSU_CLIENT_ID,
  clientSecret: process.env.OSU_CLIENT_SECRET,
  /* profile(profile) {
    return {
      id: profile.id,
      email: null,
      name: profile.username,
      image: profile.avatar_url,
      country: profile.country.code,
    };
  }, */
});

const discordConfig = DiscordProvider({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds+guilds.join",
  /* profile(profile) {
    return {};
  }, */
});

const authOptions = {
  providers: [osuConfig, discordConfig],
  session: { strategy: "jwt" },
  callbacks: {
    // Check for and apply user updates on sign in to the database
    /* async signIn(user) {
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
            if (newData.hasOwnProperty(key) && currentData.hasOwnProperty(key)) {
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
    }, */
    // JSON Web Token stores a payload in the browser's cookies (if using JWT)
    // This callback is called at sign in (created): user, account, profile, isNewUser is passed
    // Or when updated (client accesses session): token is only passed
    async jwt({ token, user, account, profile, isNewUser }) {
      //on sign in
      if (account) {
        token.provider = account.provider;

        if (account.provider === "osu" || account.provider === "discord") {
          const dbAccount = await xata.db.nextauth_accounts
            .filter({ "user.id": token.sub, provider: account.provider, providerAccountId: account.providerAccountId })
            .select(["id", "user.id", "user.name", "access_token", "refresh_token", "expires_at", "last_logged_in"])
            .getFirst();

          if (dbAccount) {
            await xata.db.nextauth_accounts.update(dbAccount.id, {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              last_logged_in: new Date().toISOString(),
            });

            if (profile && account.provider === "osu") {
              if (dbAccount.user.name !== profile.username) {
                console.log("Updating user name...");
                await xata.db.nextauth_users.update(token.sub, { name: profile.username });
              }
              token.osu_id = profile.id;
            }
          }
          console.log(`${dbAccount.user.name} signed in with ${account.provider}!`);
        }
      }
      //on session access

      return token;
    },
    //exposes token client side
    async session({ session, token, user }) {
      session.provider = token.provider;
      session.sub = token.sub;
      if (token.osu_id) {
        session.osu_id = token.osu_id;
      }

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
    /* async session(message) {
      console.log("Session Active");
    }, */
  },
  adapter: XataAdapter(xata),
  pages: {
    signIn: "/not-signed-in",
  },
};

export default NextAuth(authOptions);

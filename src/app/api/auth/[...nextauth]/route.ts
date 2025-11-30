import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { google } from "googleapis";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables",
  );
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
          );
          oauth2Client.setCredentials({
            access_token: account.access_token,
          });

          const youtube = google.youtube({
            version: "v3",
            auth: oauth2Client,
          });

          const response = await youtube.channels.list({
            part: ["snippet"],
            mine: true,
          });

          if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            token.youtubeChannel = {
              id: channel.id || "",
              title: channel.snippet?.title || "",
              description: channel.snippet?.description,
              thumbnail:
                channel.snippet?.thumbnails?.default?.url ||
                channel.snippet?.thumbnails?.medium?.url ||
                channel.snippet?.thumbnails?.high?.url,
              customUrl: channel.snippet?.customUrl,
            };
          }
        } catch (error) {
          console.error("Failed to fetch YouTube channel info:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.youtubeChannel) {
        session.youtubeChannel = token.youtubeChannel;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

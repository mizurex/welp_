
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
 
export const { handlers, signIn, signOut, auth } = NextAuth({

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {

      console.log(user);
      console.log(account);
      console.log(profile);
      return true;
    },
    
        async jwt({ token, account }) {
        // Store Google ID in JWT token
        if (account?.provider === "google") {
          token.googleId = account.providerAccountId;
        }
        return token;
      },
      
      async session({ session, token }) {
        // Put Google ID in session so you can access it
        if (token.googleId) {
          session.user.id = token.googleId as string;
        }
        return session;
      },

     
  },
})
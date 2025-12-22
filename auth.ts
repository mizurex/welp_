
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

function generatePublicId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);
  return prefix + "_" + randomPart + timePart;
}

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
    async signIn() {
      // We do user creation in the jwt callback
      return true;
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const googleId = account.providerAccountId;
        const email =
          (token.email as string | undefined) ||
          (profile?.email as string | undefined) ||
          undefined;
        const name =
          (token.name as string | undefined) ||
          (profile?.name as string | undefined) ||
          undefined;

        token.googleId = googleId;

        if (email) {
          const existing = await prisma.user.findUnique({
            where: { email },
          });

          let userRecord;

          if (!existing) {
            const publicId = generatePublicId("usr");

            userRecord = await prisma.user.create({
              data: {
                email,
                name: name || "",
                publicId,
                googleId,
              },
            });
          } else {
            userRecord = await prisma.user.update({
              where: { id: existing.id },
              data: {
                name: name || existing.name,
                googleId: existing.googleId || googleId,
              },
            });
          }

          (token as any).appUserId = userRecord.publicId;
          (token as any).appUserDbId = userRecord.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if ((token as any).googleId) {
        (session.user as any).googleId = (token as any).googleId;
      }

      if ((token as any).appUserId) {
        (session.user as any).appUserId = (token as any).appUserId;
      }

      if ((token as any).appUserDbId) {
        (session.user as any).appUserDbId = (token as any).appUserDbId;
      }

      return session;
    },
  },
});
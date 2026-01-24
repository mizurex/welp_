import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query, queryOne } from "@/lib/db";
import type { User } from "@/types/models";

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
          const existing = await queryOne<User>(
            `SELECT * FROM "User" WHERE "email" = $1`,
            [email]
          );

          let userRecord: User;

          if (!existing) {
            const publicId = generatePublicId("usr");
            userRecord = (await queryOne<User>(
              `INSERT INTO "User" ("email", "name", "publicId", "googleId")
               VALUES ($1, $2, $3, $4)
               RETURNING *`,
              [email, name || "", publicId, googleId]
            ))!;
          } else {
            userRecord = (await queryOne<User>(
              `UPDATE "User"
               SET "name" = COALESCE($2, "name"),
                   "googleId" = COALESCE($3, "googleId")
               WHERE "id" = $1
               RETURNING *`,
              [existing.id, name || existing.name, existing.googleId || googleId]
            ))!;
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

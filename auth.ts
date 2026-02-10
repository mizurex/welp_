import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import { query, queryOne } from "@/lib/db/db";
import type { User } from "@/types/models";

function generatePublicId(prefix: string): string {
  return `${prefix}_${nanoid(16)}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
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
        const email =
          (token.email as string | undefined) ||
          (profile?.email as string | undefined) ||
          undefined;
        const name =
          (token.name as string | undefined) ||
          (profile?.name as string | undefined) ||
          undefined;

        if (email) {
          const existing = await queryOne<User>(
            `SELECT * FROM "User" WHERE "email" = $1`,
            [email]
          );

          let userRecord: User;

          if (!existing) {
            const publicId = generatePublicId("usr");
            userRecord = (await queryOne<User>(
              `INSERT INTO "User" ("email", "name", "publicId")
               VALUES ($1, $2, $3)
               RETURNING *`,
              [email, name || "", publicId]
            ))!;
          } else {
            userRecord = (await queryOne<User>(
              `UPDATE "User"
               SET "name" = COALESCE($2, "name")
               WHERE "id" = $1
               RETURNING *`,
              [existing.id, name || existing.name]
            ))!;
          }

          (token as any).appUserId = userRecord.publicId;
          (token as any).appUserDbId = userRecord.id;
        }
      }

      return token;
    },

    
  },
});

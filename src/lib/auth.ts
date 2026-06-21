import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { query } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const users = await query<any[]>(
          `SELECT u.*, i.name as institutionName, t.id as teacherId, p.id as parentId, ia.id as adminId
           FROM User u
           LEFT JOIN Institution i ON i.id = u.institutionId
           LEFT JOIN Teacher t ON t.userId = u.id
           LEFT JOIN Parent p ON p.userId = u.id
           LEFT JOIN InstitutionalAdmin ia ON ia.userId = u.id
           WHERE u.email = ? LIMIT 1`,
          [credentials.email],
        )

        const user = users[0]
        if (!user || !user.isActive) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId ?? null,
          institutionName: user.institutionName ?? null,
          teacherId: user.teacherId ?? null,
          parentId: user.parentId ?? null,
          adminId: user.adminId ?? null,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          role: string
          institutionId: number | null
          institutionName: string | null
          teacherId: number | null
          parentId: number | null
          adminId: number | null
        }
        token.id = user.id
        token.role = u.role
        token.institutionId = u.institutionId
        token.institutionName = u.institutionName
        token.teacherId = u.teacherId
        token.parentId = u.parentId
        token.adminId = u.adminId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.institutionId = token.institutionId as number | null
        session.user.institutionName = token.institutionName as string | null
        session.user.teacherId = token.teacherId as number | null
        session.user.parentId = token.parentId as number | null
        session.user.adminId = token.adminId as number | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const usernameLower = credentials.username.toLowerCase()

        // Find user by username (case-insensitive)
        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: usernameLower,
              mode: 'insensitive'
            }
          }
        })

        // User exists - verify password (demo: accept any password)
        if (user) {
          return {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            image: user.image,
          }
        }

        // User doesn't exist - create new account
        const newUser = await prisma.user.create({
          data: {
            username: usernameLower,
            name: credentials.username, // Keep original casing for display name
          }
        })

        return {
          id: newUser.id,
          name: newUser.name || newUser.username,
          email: newUser.email,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

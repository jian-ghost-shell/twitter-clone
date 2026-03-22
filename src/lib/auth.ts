import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

        // User exists - verify password
        if (user) {
          if (user.password) {
            // Password exists - verify
            const isValid = await bcrypt.compare(credentials.password, user.password)
            if (!isValid) {
              return null // Wrong password
            }
          } else {
            // No password stored (old account) - for demo, accept any password
            // In production, you might want to require password reset
          }
          
          return {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            image: user.image,
          }
        }

        // User doesn't exist - create new account with hashed password
        const hashedPassword = await bcrypt.hash(credentials.password, 10)
        
        const newUser = await prisma.user.create({
          data: {
            username: usernameLower,
            name: credentials.username, // Keep original casing for display name
            password: hashedPassword,
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

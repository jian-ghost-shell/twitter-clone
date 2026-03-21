'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function AuthButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <span className="auth-btn loading">...</span>
  }

  if (session?.user) {
    return (
      <div className="auth-user">
        <span className="auth-user-name">{session.user.name || session.user.email}</span>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="auth-btn signout"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => router.push('/auth/signin')}
      className="auth-btn signin"
    >
      Sign In
    </button>
  )
}

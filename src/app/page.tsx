'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { TweetForm } from '@/components/TweetForm'
import { Feed } from '@/components/Feed'
import { AuthButton } from '@/components/AuthButton'

export default function Home() {
  const { data: session } = useSession()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTweetCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Home</h1>
        <AuthButton />
      </header>
      
      {session ? (
        <TweetForm 
          currentUser={session.user} 
          onTweetCreated={handleTweetCreated} 
        />
      ) : (
        <div className="login-prompt">
          <p>Sign in to post a tweet</p>
        </div>
      )}
      
      <Feed refreshTrigger={refreshTrigger} />
    </div>
  )
}

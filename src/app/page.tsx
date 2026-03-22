'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TweetForm } from '@/components/TweetForm'
import { Feed } from '@/components/Feed'
import { AuthButton } from '@/components/AuthButton'

type TabType = 'home' | 'following'

export default function Home() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTweetCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const feedEndpoint = activeTab === 'following' ? '/api/tweets/following' : '/api/tweets'

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Home</h1>
        <div className="header-actions">
          <Link href="/search" className="search-icon">🔍</Link>
          <Link href="/bookmarks" className="bookmarks-icon">🔖</Link>
          <AuthButton />
        </div>
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
      
      <div className="home-tabs">
        <button 
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>
      
      <Feed 
        refreshTrigger={refreshTrigger} 
        endpoint={feedEndpoint}
        key={feedEndpoint}
      />
    </div>
  )
}

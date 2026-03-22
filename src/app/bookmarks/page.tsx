'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Feed } from '@/components/Feed'

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (status === 'loading') {
    return (
      <div className="bookmarks-loading">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bookmarks-auth">
        <p>Please sign in to view your bookmarks</p>
      </div>
    )
  }

  const handleBookmarkChanged = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="bookmarks-container">
      <header className="bookmarks-header">
        <h1>Bookmarks</h1>
      </header>
      
      <Feed 
        refreshTrigger={refreshTrigger} 
        endpoint="/api/bookmarks"
        key="/api/bookmarks"
      />
    </div>
  )
}

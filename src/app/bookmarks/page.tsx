'use client'

import { useSession } from 'next-auth/react'
import { Feed } from '@/components/Feed'

export default function BookmarksPage() {
  const { data: session, status } = useSession()

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

  return (
    <div className="bookmarks-container">
      <header className="bookmarks-header">
        <h1>Bookmarks</h1>
      </header>
      
      <Feed 
        endpoint="/api/bookmarks"
        key="/api/bookmarks"
      />
    </div>
  )
}

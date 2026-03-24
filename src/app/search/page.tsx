'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Tweet, User } from '@/lib/api'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ tweets: Tweet[]; users: User[] }>({ tweets: [], users: [] })
  const [loading, setLoading] = useState(false)

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults({ tweets: [], users: [] })
      return
    }

    setLoading(true)
    try {
      const data = await api.search.all(q)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <>
      <header className="search-header">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tweets and users..."
            className="search-input"
          />
        </form>
      </header>

      <div className="search-results">
        {loading ? (
          <p className="search-loading">Searching...</p>
        ) : (
          <>
            {results.users.length > 0 && (
              <div className="search-section">
                <h2>Users</h2>
                {results.users.map((user) => (
                  <Link href={`/profile/${user.id}`} key={user.id} className="search-user">
                    <div className="search-user-avatar">
                      {user.image ? (
                        <img src={user.image} alt={user.name || ''} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="search-user-info">
                      <span className="search-user-name">{user.name || 'Anonymous'}</span>
                      <span className="search-user-meta">
                        {user.tweetsCount} tweets · {user.followersCount} followers
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {results.tweets.length > 0 && (
              <div className="search-section">
                <h2>Tweets</h2>
                {results.tweets.map((tweet) => (
                  <div key={tweet.id} className="tweet">
                    <div className="tweet-avatar">
                      {tweet.user.image ? (
                        <img src={tweet.user.image} alt={tweet.user.name || ''} />
                      ) : (
                        <div className="tweet-avatar-placeholder">
                          {tweet.user.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="tweet-content">
                      <div className="tweet-header">
                        <Link href={`/profile/${tweet.user.id}`} className="tweet-name">
                          {tweet.user.name || 'Anonymous'}
                        </Link>
                        <span className="tweet-time">
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="tweet-text">{tweet.content}</div>
                      {tweet.image && (
                        <div className="tweet-image">
                          <img src={tweet.image} alt="Tweet" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query && results.tweets.length === 0 && results.users.length === 0 && (
              <p className="search-empty">No results found for "{query}"</p>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <div className="search-container">
      <Suspense fallback={<div className="search-loading">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  )
}

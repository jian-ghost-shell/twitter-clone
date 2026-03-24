'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRealtime } from '@/hooks/useRealtime'

type NotificationType = 'like' | 'retweet' | 'reply' | 'follow'

interface Notification {
  id: string
  type: NotificationType
  actor: {
    id: string
    name: string | null
    username: string
    image: string | null
  }
  tweet?: {
    id: string
    content: string
  } | null
  read: boolean
  createdAt: string
}

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case 'like': return '❤️'
    case 'retweet': return '🔁'
    case 'reply': return '💬'
    case 'follow': return '👤'
  }
}

const typeText = (type: NotificationType, actorName: string | null) => {
  switch (type) {
    case 'like': return `${actorName || 'Someone'} liked your tweet`
    case 'retweet': return `${actorName || 'Someone'} retweeted your tweet`
    case 'reply': return `${actorName || 'Someone'} replied to your tweet`
    case 'follow': return `${actorName || 'Someone'} followed you`
  }
}

export function NotificationDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (open && session) {
      fetchNotifications()
    }
  }, [open, session])

  // Real-time: refetch notification count when new one arrives
  useRealtime((event) => {
    if (event.type === 'notification' && !open) {
      // Just refresh the count silently
      fetchNotifications()
    }
  })

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  if (!session) return null

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id)
                    if (n.tweet) {
                      window.location.href = `/tweet/${n.tweet.id}`
                    } else if (n.type === 'follow') {
                      window.location.href = `/profile/${n.actor.id}`
                    }
                    setOpen(false)
                  }}
                >
                  <span className="notification-icon">{typeIcon(n.type)}</span>
                  <div className="notification-content">
                    <p className="notification-text">{typeText(n.type, n.actor.name)}</p>
                    {n.tweet && (
                      <p className="notification-preview">{n.tweet.content.slice(0, 50)}...</p>
                    )}
                    <span className="notification-time">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

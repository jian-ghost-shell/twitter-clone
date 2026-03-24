import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerNotification } from '@/lib/pusher-server'
import { followUser, unfollowUser } from '@/lib/services/userService'

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params
    const { following, notification } = await followUser(session.user.id, followingId)

    // Real-time notification
    if (notification) {
      await triggerNotification(followingId, {
        id: notification.id,
        type: 'follow',
        actorId: session.user.id,
      }).catch(console.error)
    }

    return NextResponse.json({ following })
  } catch (error: any) {
    console.error('Error following user:', error)
    if (error.message === 'Cannot follow yourself') {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }
    if (error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (error.message === 'Already following') {
      return NextResponse.json({ error: 'Already following' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params
    await unfollowUser(session.user.id, followingId)
    return NextResponse.json({ following: false })
  } catch (error: any) {
    console.error('Error unfollowing user:', error)
    if (error.message === 'Not following') {
      return NextResponse.json({ error: 'Not following' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
  }
}

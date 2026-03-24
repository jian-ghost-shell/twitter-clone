import { prisma } from '@/lib/prisma'

export interface UserWithStats {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  isFollowing: boolean
  followersCount: number
  followingCount: number
  tweetsCount: number
}

export async function getUser(
  userId: string,
  currentUserId?: string | null
): Promise<UserWithStats | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          followedBy: true,
          following: true,
          tweets: true,
        },
      },
    },
  })

  if (!user) return null

  let isFollowing = false
  if (currentUserId && currentUserId !== userId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    })
    isFollowing = !!follow
  }

  return {
    ...user,
    isFollowing,
    followersCount: user._count.followedBy,
    followingCount: user._count.following,
    tweetsCount: user._count.tweets,
  }
}

export interface FollowResult {
  following: boolean
  notification?: any
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }

  const user = await prisma.user.findUnique({ where: { id: followingId } })
  if (!user) {
    throw new Error('User not found')
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })

  if (existingFollow) {
    throw new Error('Already following')
  }

  await prisma.follow.create({ data: { followerId, followingId } })

  const notification = await prisma.notification.create({
    data: {
      type: 'follow',
      userId: followingId,
      actorId: followerId,
    },
  })

  return { following: true, notification }
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ following: boolean }> {
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })

  if (!existingFollow) {
    throw new Error('Not following')
  }

  await prisma.follow.delete({ where: { id: existingFollow.id } })
  return { following: false }
}

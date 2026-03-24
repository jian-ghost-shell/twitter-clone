import { prisma } from '@/lib/prisma'

// Helper: build tweet include clause
function tweetInclude(userId?: string | null) {
  return {
    user: {
      select: { id: true, name: true, image: true },
    },
    parent: {
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    },
    retweetOf: {
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, retweets: true, replies: true } },
      },
    },
    _count: { select: { likes: true, retweets: true, replies: true } },
  }
}

// Helper: add liked/retweeted status to tweets
async function addStatusToTweets(tweets: any[], userId?: string | null) {
  if (!userId) {
    return tweets.map(t => ({ ...t, liked: false, retweeted: false }))
  }

  const tweetIds = tweets.map(t => t.id)
  const retweetOfIds = tweets.map(t => t.retweetOfId || t.id)

  const likes = await prisma.like.findMany({
    where: { userId, tweetId: { in: tweetIds } },
    select: { tweetId: true },
  })
  const userLikes = new Set(likes.map(l => l.tweetId))

  const userRetweets = await prisma.tweet.findMany({
    where: { userId, retweetOfId: { in: retweetOfIds } },
    select: { retweetOfId: true },
  })
  const userRetweetOfIds = new Set(userRetweets.map(r => r.retweetOfId!))

  return tweets.map(tweet => ({
    ...tweet,
    liked: userLikes.has(tweet.id),
    retweeted: tweet.retweetOfId
      ? tweet.userId === userId
      : userRetweetOfIds.has(tweet.id),
  }))
}

export interface GetTweetsResult {
  tweets: any[]
  nextCursor: string | null
}

export async function getTweets(
  cursor?: string | null,
  userId?: string | null
): Promise<GetTweetsResult> {
  const limit = 20

  const tweets = await prisma.tweet.findMany({
    where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
    include: tweetInclude(userId),
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  })

  const hasMore = tweets.length > limit
  const results = hasMore ? tweets.slice(0, limit) : tweets
  const nextCursor =
    hasMore && results.length > 0
      ? results[results.length - 1].createdAt.toISOString()
      : null

  const tweetsWithStatus = await addStatusToTweets(results, userId)
  return { tweets: tweetsWithStatus, nextCursor }
}

export async function getTweetsByUser(
  userId: string,
  requestingUserId?: string | null
) {
  const tweets = await prisma.tweet.findMany({
    where: { userId },
    include: tweetInclude(requestingUserId),
    orderBy: { createdAt: 'desc' },
  })

  return addStatusToTweets(tweets, requestingUserId)
}

export async function createTweet(
  userId: string,
  content: string,
  image?: string | null,
  parentId?: string | null
) {
  const tweet = await prisma.tweet.create({
    data: {
      content: content || '',
      image: image || null,
      userId,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  return tweet
}

export async function deleteTweet(tweetId: string, userId: string) {
  const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (!tweet) {
    throw new Error('Tweet not found')
  }

  if (tweet.userId !== userId) {
    throw new Error('Forbidden')
  }

  await prisma.tweet.delete({ where: { id: tweetId } })
  return { success: true }
}

export interface LikeResult {
  liked: boolean
  notification?: any
}

export async function likeTweet(
  userId: string,
  tweetId: string
): Promise<LikeResult> {
  const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (!tweet) {
    throw new Error('Tweet not found')
  }

  const existingLike = await prisma.like.findUnique({
    where: { userId_tweetId: { userId, tweetId } },
  })

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } })
    return { liked: false }
  }

  await prisma.like.create({ data: { userId, tweetId } })

  let notification: any = undefined
  if (tweet.userId !== userId) {
    notification = await prisma.notification.create({
      data: {
        type: 'like',
        userId: tweet.userId,
        actorId: userId,
        tweetId,
      },
    })
  }

  return { liked: true, notification }
}

export interface RetweetResult {
  retweeted: boolean
  retweet?: any
}

export async function retweetTweet(
  userId: string,
  tweetId: string
): Promise<RetweetResult> {
  const originalTweet = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (!originalTweet) {
    throw new Error('Tweet not found')
  }

  const existingRetweet = await prisma.tweet.findFirst({
    where: { userId, retweetOfId: tweetId },
  })

  if (existingRetweet) {
    await prisma.tweet.delete({ where: { id: existingRetweet.id } })
    return { retweeted: false }
  }

  const retweetTweet = await prisma.tweet.create({
    data: {
      content: '',
      userId,
      retweetOfId: tweetId,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  // Create notification (but not for self-retweets)
  if (originalTweet.userId !== userId) {
    await prisma.notification.create({
      data: {
        type: 'retweet',
        userId: originalTweet.userId,
        actorId: userId,
        tweetId,
      },
    })
  }

  return { retweeted: true, retweet: retweetTweet }
}

export interface ReplyResult {
  reply: any
  notification?: any
}

export async function replyToTweet(
  userId: string,
  tweetId: string,
  content: string
): Promise<ReplyResult> {
  const parentTweet = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (!parentTweet) {
    throw new Error('Parent tweet not found')
  }

  const reply = await prisma.tweet.create({
    data: {
      content,
      userId,
      parentId: tweetId,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  let notification: any = undefined
  if (parentTweet.userId !== userId) {
    notification = await prisma.notification.create({
      data: {
        type: 'reply',
        userId: parentTweet.userId,
        actorId: userId,
        tweetId: reply.id,
      },
    })
  }

  return { reply, notification }
}

export async function toggleBookmark(userId: string, tweetId: string) {
  const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (!tweet) {
    throw new Error('Tweet not found')
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_tweetId: { userId, tweetId } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return { bookmarked: false }
  }

  await prisma.bookmark.create({ data: { userId, tweetId } })
  return { bookmarked: true }
}

export async function getFollowingTweets(userId: string, cursor?: string | null) {
  const limit = 20

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = following.map(f => f.followingId)

  if (followingIds.length === 0) {
    return { tweets: [], nextCursor: null }
  }

  const tweets = await prisma.tweet.findMany({
    where: {
      userId: { in: followingIds },
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : undefined),
    },
    include: tweetInclude(userId),
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  })

  const hasMore = tweets.length > limit
  const results = hasMore ? tweets.slice(0, limit) : tweets
  const nextCursor =
    hasMore && results.length > 0
      ? results[results.length - 1].createdAt.toISOString()
      : null

  const tweetsWithStatus = await addStatusToTweets(results, userId)
  return { tweets: tweetsWithStatus, nextCursor }
}

export async function getBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      tweet: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true, retweets: true, replies: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookmarks.map(b => ({ ...b.tweet, bookmarked: true }))
}

export async function getTweetById(tweetId: string, userId?: string | null) {
  const tweet = await prisma.tweet.findUnique({
    where: { id: tweetId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      parent: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true, retweets: true, replies: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { likes: true, retweets: true, replies: true } },
    },
  })

  if (!tweet) return null

  let liked = false
  let retweeted = false

  if (userId) {
    const like = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId } },
    })
    liked = !!like

    const retweet = await prisma.tweet.findFirst({
      where: { userId, retweetOfId: tweetId },
    })
    retweeted = !!retweet
  }

  return { ...tweet, liked, retweeted }
}

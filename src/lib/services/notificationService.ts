import { prisma } from '@/lib/prisma'

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: { id: true, name: true, username: true, image: true },
      },
      tweet: {
        select: { id: true, content: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })
  return { success: true }
}

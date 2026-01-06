'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from "@tanstack/react-start/server";
import { db } from '@/db/db'
import { pushSubscriptions } from '@/db/push-schema'
import { users } from '@/db/auth-schema'
import { eq, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export interface PushNotificationPayload {
    title: string
    options?: NotificationOptions & {
        tag?: string
        requireInteraction?: boolean
        data?: Record<string, any>
    }
}

/**
 * Initialize web-push (server-only)
 */
async function initializeWebPush() {
    const webpush = await import('web-push').then(m => m.default)
    webpush.setVapidDetails(
        'mailto:support@pinger.app',
        process.env.VITE_PUBLIC_VAPID_PUBLIC_KEY || '',
        process.env.VITE_VAPID_PRIVATE_KEY || ''
    )
    return webpush
}

/**
 * Broadcast push notification server function
 */
export const broadcastPushNotification = createServerFn(
    { method: 'POST' })
    .inputValidator((input: { title: string, message?: string, icon?: string }) => input)
    .handler(async ({ data }) => {
        try {
            const webpush = await initializeWebPush()
            const allSubscriptions = await db.select().from(pushSubscriptions)

            if (allSubscriptions.length === 0) {
                console.log('No push subscriptions found')
                return { success: 0, failed: 0 }
            }

            let success = 0
            let failed = 0

            if (!data || !data.title)
                throw new Error('No data provided for broadcast');


            // Get current user from request
            const request = getRequest() as any
            const session = await auth.api.getSession({
                headers: request.headers,
            })

            if (!session?.user?.id) {
                throw new Error('Unauthorized: User not authenticated')
            }

            const senderId = session.user.id

            const pushPayload = JSON.stringify({
                title: data.title,
                options: {
                    body: data.message,
                    icon: data.icon || '/logo192.png',
                    badge: '/favicon.ico',
                    tag: `notification-${Date.now()}`,
                    data: {
                        senderId,
                        senderName: session.user.name,
                    },
                },
            })

            for (const subscription of allSubscriptions) {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: subscription.endpoint,
                            keys: {
                                auth: subscription.auth,
                                p256dh: subscription.p256dh,
                            },
                        },
                        pushPayload
                    )

                    success++
                } catch (error) {
                    console.error(
                        `Failed to send broadcast notification to ${subscription.endpoint}:`,
                        error
                    )

                    // Delete invalid subscriptions
                    if (error instanceof Error && error.message.includes('410')) {
                        await db
                            .delete(pushSubscriptions)
                            .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
                    }

                    failed++
                }
            }

            console.log(
                `Broadcast complete: ${success} success, ${failed} failed`
            )
            return { success, failed }
        } catch (error) {
            console.error('Error broadcasting push notifications:', error)
            return { success: 0, failed: 0 }
        }
    }
    )

/**
 * Server function: Send push notification from one user to selected users
 */
export const sendPushNotificationToSelectedUsers = createServerFn(
    { method: 'POST' })
    .inputValidator((input: { recipientUserIds: string[], title: string, message?: string, icon?: string }) => input)
    .handler(async ({ data }) => {
        try {
            // Get current user from request
            const request = getRequest() as any
            const session = await auth.api.getSession({
                headers: request.headers,
            })

            if (!session?.user?.id) {
                throw new Error('Unauthorized: User not authenticated')
            }

            const senderId = session.user.id
            const { recipientUserIds, title, message, icon } = data

            if (!recipientUserIds || recipientUserIds.length === 0) {
                throw new Error('No recipient users specified')
            }

            if (!title) {
                throw new Error('Notification title is required')
            }

            // Verify all recipients exist and user is allowed to send to them
            const recipientUsers = await db
                .select()
                .from(users)
                .where(inArray(users.id, recipientUserIds))

            if (recipientUsers.length === 0) {
                throw new Error('No valid recipient users found')
            }

            const payload: PushNotificationPayload = {
                title,
                options: {
                    body: message,
                    icon: icon || '/logo192.png',
                    badge: '/favicon.ico',
                    tag: `notification-${Date.now()}`,
                    data: {
                        senderId,
                        senderName: session.user.name,
                    },
                },
            }

            let totalSuccess = 0
            let totalFailed = 0

            // Send to each selected recipient
            for (const recipientId of recipientUserIds) {
                const result = await sendPushNotificationToUser(recipientId, payload)
                totalSuccess += result.success
                totalFailed += result.failed
            }

            console.log(
                `User ${senderId} sent notifications: ${totalSuccess} success, ${totalFailed} failed`
            )

            return {
                success: true,
                message: `Notification sent to TEST users`,
                result: {
                    success: "totalSuccess",
                    failed: "totalFailed",
                },
            }
        } catch (error) {
            console.error('Error in sendPushNotificationToSelectedUsers:', error)
            throw new Error(
                error instanceof Error ? error.message : 'Failed to send notification'
            )
        }
    }
    )

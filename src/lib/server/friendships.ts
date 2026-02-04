import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { and, eq, or, sql } from "drizzle-orm"
import { friendships, users } from "@/../auth-schema"
import { db } from "@/database/db"
import { auth } from "@/lib/auth"

export const getAllUsers = createServerFn({ method: "GET" }).handler(
    async () => {
        const request = getRequest()
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user) {
            return []
        }

        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image
            })
            .from(users)
            .where(sql`${users.id} != ${session.user.id}`)
            .limit(50)

        return allUsers
    }
)

export const searchUsers = createServerFn({ method: "POST" }).handler(
    async (ctx: any) => {
        const request = getRequest()
        const data = ctx.data as { q?: string }
        const query = data?.q || ""

        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user) {
            return []
        }

        if (!query) {
            return getAllUsers()
        }

        const searchPattern = `%${query.toLowerCase()}%`

        const foundUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image
            })
            .from(users)
            .where(
                and(
                    sql`${users.id} != ${session.user.id}`,
                    or(
                        sql`lower(${users.name}) like ${searchPattern}`,
                        sql`lower(${users.email}) like ${searchPattern}`
                    )
                )
            )
            .limit(20)

        return foundUsers
    }
)

export const getFriendshipStatus = createServerFn({ method: "POST" }).handler(
    async (ctx: any) => {
        const request = getRequest()
        const data = ctx.data as { userId?: string }
        const userId = data?.userId

        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user || !userId) {
            return null
        }

        const friendship = await db
            .select()
            .from(friendships)
            .where(
                or(
                    and(
                        eq(friendships.senderId, session.user.id),
                        eq(friendships.receiverId, userId)
                    ),
                    and(
                        eq(friendships.senderId, userId),
                        eq(friendships.receiverId, session.user.id)
                    )
                )
            )
            .limit(1)

        return friendship[0] || null
    }
)

export const getFriendshipStatusesForUsers = createServerFn({
    method: "POST"
}).handler(async (ctx: any) => {
    const request = getRequest()
    const data = ctx.data as { userIds?: string[] }
    const userIds = data?.userIds || []

    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session?.user || userIds.length === 0) {
        return {}
    }

    const userFriendships = await db
        .select({
            id: friendships.id,
            senderId: friendships.senderId,
            receiverId: friendships.receiverId,
            status: friendships.status
        })
        .from(friendships)
        .where(
            and(
                or(
                    ...userIds.map((userId) =>
                        or(
                            and(
                                eq(friendships.senderId, session.user.id),
                                eq(friendships.receiverId, userId)
                            ),
                            and(
                                eq(friendships.senderId, userId),
                                eq(friendships.receiverId, session.user.id)
                            )
                        )
                    )
                ),
                or(
                    eq(friendships.status, "pending"),
                    eq(friendships.status, "accepted"),
                    eq(friendships.status, "blocked")
                )
            )
        )

    const statusMap: Record<string, { status: string; senderId?: string }> =
        {}

    for (const friendship of userFriendships) {
        const otherUserId =
            friendship.senderId === session.user.id
                ? friendship.receiverId
                : friendship.senderId
        statusMap[otherUserId] = {
            status: friendship.status,
            senderId: friendship.senderId
        }
    }

    return statusMap
})

export const sendFriendRequest = createServerFn({ method: "POST" }).handler(
    async (ctx: any) => {
        const request = getRequest()
        const data = ctx.data as { receiverId?: string }
        const receiverId = data?.receiverId

        if (!receiverId) {
            throw new Error("Receiver ID is required")
        }

        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user) {
            throw new Error("Not authenticated")
        }

        if (session.user.id === receiverId) {
            throw new Error("Cannot send friend request to yourself")
        }

        // Check if already friends or blocked
        const existing = await db
            .select()
            .from(friendships)
            .where(
                or(
                    and(
                        eq(friendships.senderId, session.user.id),
                        eq(friendships.receiverId, receiverId)
                    ),
                    and(
                        eq(friendships.senderId, receiverId),
                        eq(friendships.receiverId, session.user.id)
                    )
                )
            )
            .limit(1)

        if (existing.length > 0) {
            const status = existing[0].status
            if (status === "blocked") {
                throw new Error("Cannot send friend request to this user")
            }
            if (status === "accepted") {
                throw new Error("Already friends with this user")
            }
            if (status === "pending") {
                throw new Error("Friend request already pending")
            }
        }

        const id = crypto.randomUUID()
        await db.insert(friendships).values({
            id,
            senderId: session.user.id,
            receiverId: receiverId,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return { success: true }
    }
)

export const getPendingFriendRequests = createServerFn({
    method: "GET"
}).handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session?.user) {
        return []
    }

    const requests = await db
        .select({
            friendship: friendships,
            sender: {
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image
            }
        })
        .from(friendships)
        .innerJoin(users, eq(friendships.senderId, users.id))
        .where(
            and(
                eq(friendships.receiverId, session.user.id),
                eq(friendships.status, "pending")
            )
        )
        .orderBy(friendships.createdAt)

    return requests
})

export const respondToFriendRequest = createServerFn({
    method: "POST"
}).handler(async (ctx: any) => {
    const request = getRequest()
    const data = ctx.data as {
        friendshipId?: string
        action?: "accept" | "deny" | "block"
    }
    const { friendshipId, action } = data

    if (!friendshipId || !action) {
        throw new Error("Friendship ID and action are required")
    }

    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session?.user) {
        throw new Error("Not authenticated")
    }

    const friendship = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.id, friendshipId),
                eq(friendships.receiverId, session.user.id)
            )
        )
        .limit(1)

    if (friendship.length === 0) {
        throw new Error("Friend request not found")
    }

    if (action === "accept") {
        await db
            .update(friendships)
            .set({ status: "accepted", updatedAt: new Date() })
            .where(eq(friendships.id, friendshipId))
    } else if (action === "deny") {
        await db.delete(friendships).where(eq(friendships.id, friendshipId))
    } else if (action === "block") {
        await db
            .update(friendships)
            .set({ status: "blocked", updatedAt: new Date() })
            .where(eq(friendships.id, friendshipId))
    }

    return { success: true }
})

export const getFriends = createServerFn({ method: "GET" }).handler(
    async () => {
        const request = getRequest()
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user) {
            return []
        }

        const friendsList = await db
            .select({
                friendship: friendships,
                friend: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image
                }
            })
            .from(friendships)
            .innerJoin(
                users,
                or(
                    and(
                        eq(friendships.senderId, session.user.id),
                        eq(users.id, friendships.receiverId)
                    ),
                    and(
                        eq(friendships.receiverId, session.user.id),
                        eq(users.id, friendships.senderId)
                    )
                )
            )
            .where(
                and(
                    eq(friendships.status, "accepted"),
                    or(
                        eq(friendships.senderId, session.user.id),
                        eq(friendships.receiverId, session.user.id)
                    )
                )
            )

        return friendsList
    }
)

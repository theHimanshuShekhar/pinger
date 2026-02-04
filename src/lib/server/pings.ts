import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { and, eq, gt, inArray, or } from "drizzle-orm"
import { pingInvites, pings } from "../../../auth-schema"
import { db } from "../../database/db"
import { auth } from "../auth"

const PING_EXPIRY_HOURS = 1

function generateId(): string {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    )
}

async function getCurrentUserFromRequest() {
    const request = getRequest()
    if (!request) return null

    const session = await auth.api.getSession({
        headers: request.headers
    })
    return session?.user ?? null
}

export const createPing = createServerFn({ method: "POST" }).handler(
    async (ctx) => {
        const user = await getCurrentUserFromRequest()
        if (!user) {
            throw new Error("Unauthorized")
        }

        const data = ctx.data
        if (!data) {
            throw new Error("No data provided")
        }

        const { message, game, scheduledAt, scheduledEndAt, invitedUserIds } =
            data as {
                message?: string
                game?: string
                scheduledAt?: string
                scheduledEndAt?: string
                invitedUserIds: string[]
            }

        if (!invitedUserIds || invitedUserIds.length === 0) {
            throw new Error("Must invite at least one friend")
        }

        const now = new Date()
        const expiresAt = new Date(
            now.getTime() + PING_EXPIRY_HOURS * 60 * 60 * 1000
        )

        const pingId = generateId()
        await db.insert(pings).values({
            id: pingId,
            creatorId: user.id,
            message,
            game,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : null,
            status: "pending",
            lastActivityAt: now,
            expiresAt
        })

        const inviteValues = invitedUserIds.map((userId) => ({
            id: generateId(),
            pingId,
            userId,
            status: "pending" as const
        }))

        await db.insert(pingInvites).values(inviteValues)

        return { success: true, pingId }
    }
)

export const getActivePings = createServerFn({ method: "GET" }).handler(
    async () => {
        const user = await getCurrentUserFromRequest()
        if (!user) {
            throw new Error("Unauthorized")
        }

        const now = new Date()

        const createdPingsRaw = await db.query.pings.findMany({
            where: and(
                eq(pings.creatorId, user.id),
                gt(pings.expiresAt, now),
                or(eq(pings.status, "pending"), eq(pings.status, "active"))
            ),
            with: {
                invites: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: (pings, { desc }) => [desc(pings.createdAt)]
        })

        const createdPings = createdPingsRaw.map((ping) => ({
            ...ping,
            participants: [
                {
                    user: { id: user.id, name: user.name, image: user.image },
                    status: "accepted",
                    isCreator: true
                },
                ...ping.invites.map((invite) => ({
                    user: invite.user,
                    status: invite.status,
                    isCreator: false
                }))
            ]
        }))

        const invitedPingIds = await db.query.pingInvites.findMany({
            where: and(
                eq(pingInvites.userId, user.id),
                eq(pingInvites.status, "pending")
            ),
            columns: {
                pingId: true
            }
        })

        const invitedPingsRaw =
            invitedPingIds.length > 0
                ? await db.query.pings.findMany({
                      where: and(
                          inArray(
                              pings.id,
                              invitedPingIds.map((i) => i.pingId)
                          ),
                          gt(pings.expiresAt, now),
                          or(
                              eq(pings.status, "pending"),
                              eq(pings.status, "active")
                          )
                      ),
                      with: {
                          creator: {
                              columns: {
                                  id: true,
                                  name: true,
                                  image: true
                              }
                          },
                          invites: {
                              with: {
                                  user: {
                                      columns: {
                                          id: true,
                                          name: true,
                                          image: true
                                      }
                                  }
                              }
                          }
                      },
                      orderBy: (pings, { desc }) => [desc(pings.createdAt)]
                  })
                : []

        const invitedPings = invitedPingsRaw.map((ping) => ({
            ...ping,
            participants: [
                {
                    user: ping.creator,
                    status: "accepted",
                    isCreator: true
                },
                ...ping.invites.map((invite) => ({
                    user: invite.user,
                    status: invite.status,
                    isCreator: false
                }))
            ]
        }))

        return {
            created: createdPings,
            invited: invitedPings
        }
    }
)

export const respondToPingInvite = createServerFn({ method: "POST" }).handler(
    async (ctx) => {
        const user = await getCurrentUserFromRequest()
        if (!user) {
            throw new Error("Unauthorized")
        }

        const data = ctx.data
        if (!data) {
            throw new Error("No data provided")
        }

        const { pingId, action } = data as {
            pingId: string
            action: "accept" | "decline"
        }

        const invite = await db.query.pingInvites.findFirst({
            where: and(
                eq(pingInvites.pingId, pingId),
                eq(pingInvites.userId, user.id)
            )
        })

        if (!invite) {
            throw new Error("Invite not found")
        }

        if (invite.status !== "pending") {
            throw new Error("Already responded to this invite")
        }

        await db
            .update(pingInvites)
            .set({
                status: action === "accept" ? "accepted" : "declined",
                respondedAt: new Date()
            })
            .where(eq(pingInvites.id, invite.id))

        if (action === "accept") {
            const now = new Date()
            const newExpiry = new Date(
                now.getTime() + PING_EXPIRY_HOURS * 60 * 60 * 1000
            )

            await db
                .update(pings)
                .set({
                    status: "active",
                    lastActivityAt: now,
                    expiresAt: newExpiry
                })
                .where(eq(pings.id, pingId))
        }

        return { success: true }
    }
)

export const updatePingActivity = createServerFn({ method: "POST" }).handler(
    async (ctx) => {
        const user = await getCurrentUserFromRequest()
        if (!user) {
            throw new Error("Unauthorized")
        }

        const data = ctx.data
        if (!data) {
            throw new Error("No data provided")
        }

        const { pingId } = data as { pingId: string }

        const ping = await db.query.pings.findFirst({
            where: eq(pings.id, pingId)
        })

        if (!ping) {
            throw new Error("Ping not found")
        }

        const isCreator = ping.creatorId === user.id
        const userInvite = await db.query.pingInvites.findFirst({
            where: and(
                eq(pingInvites.pingId, pingId),
                eq(pingInvites.userId, user.id)
            )
        })

        if (!isCreator && !userInvite) {
            throw new Error("Not authorized to update this ping")
        }

        const now = new Date()
        const newExpiry = new Date(
            now.getTime() + PING_EXPIRY_HOURS * 60 * 60 * 1000
        )

        await db
            .update(pings)
            .set({
                lastActivityAt: now,
                expiresAt: newExpiry
            })
            .where(eq(pings.id, pingId))

        return { success: true }
    }
)

export const expireOldPings = createServerFn({ method: "POST" }).handler(
    async () => {
        const now = new Date()

        await db
            .update(pings)
            .set({ status: "expired" })
            .where(
                and(
                    gt(pings.expiresAt, now),
                    or(eq(pings.status, "pending"), eq(pings.status, "active"))
                )
            )

        return { success: true }
    }
)

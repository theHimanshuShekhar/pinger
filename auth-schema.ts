import { relations } from "drizzle-orm"
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const friendshipStatusEnum = pgEnum("friendship_status", [
    "pending",
    "accepted",
    "blocked"
])

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

export const usersRelations = relations(users, ({ many }) => ({
    pings: many(pings),
    pingInvites: many(pingInvites)
}))

export const friendships = pgTable("friendships", {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
})

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
})

// Ping feature enums
export const pingStatusEnum = pgEnum("ping_status", [
    "pending",
    "active",
    "completed",
    "expired"
])

export const inviteStatusEnum = pgEnum("invite_status", [
    "pending",
    "accepted",
    "declined"
])

// Ping feature tables
export const pings = pgTable("pings", {
    id: text("id").primaryKey(),
    creatorId: text("creator_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    game: text("game"),
    scheduledAt: timestamp("scheduled_at"),
    scheduledEndAt: timestamp("scheduled_end_at"),
    status: pingStatusEnum("status").notNull().default("pending"),
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const pingInvites = pgTable("ping_invites", {
    id: text("id").primaryKey(),
    pingId: text("ping_id")
        .notNull()
        .references(() => pings.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    status: inviteStatusEnum("status").notNull().default("pending"),
    respondedAt: timestamp("responded_at")
})

// Relations
export const pingsRelations = relations(pings, ({ one, many }) => ({
    creator: one(users, {
        fields: [pings.creatorId],
        references: [users.id]
    }),
    invites: many(pingInvites)
}))

export const pingInvitesRelations = relations(pingInvites, ({ one }) => ({
    ping: one(pings, {
        fields: [pingInvites.pingId],
        references: [pings.id]
    }),
    user: one(users, {
        fields: [pingInvites.userId],
        references: [users.id]
    })
}))

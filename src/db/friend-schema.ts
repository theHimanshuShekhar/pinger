import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core"
import { users } from "./auth-schema"

export const friends = pgTable("friends", {
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    friendId: text("friend_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending, accepted, blocked
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
}, (table) => [
    primaryKey({ columns: [table.userId, table.friendId] })
])

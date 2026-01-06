import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./auth-schema"

export const pushSubscriptions = pgTable("push_subscriptions", {
    id: uuid("id").primaryKey().unique(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    auth: text("auth").notNull(),
    p256dh: text("p256dh").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
})

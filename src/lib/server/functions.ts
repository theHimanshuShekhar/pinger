import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ne } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { friends } from "@/db/friend-schema";

// get user from session
export const getUser = createServerFn({ method: "GET" }).handler(async () => {
    const headers = new Headers(getRequest()?.headers ?? {});
    const session = await auth.api.getSession({ headers });
    return session?.user || null;
});

// get all users except the current user
export const getAllUsers = createServerFn({ method: "GET" }).handler(
    async () => {
        const currentUser = await getUser();
        const usersList = await db.select().from(users).where(ne(users.id, currentUser?.id || ""));
        return usersList;
    });

// add selected users to current user's friend list
export const addFriendsToList = createServerFn({ method: "POST" })
    .inputValidator((friendIds: string[]) => friendIds)
    .handler(async ({ data }) => {

        console.log("Adding friends with IDs:", data);

        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const friendIds = data;

        const now = new Date();
        const friendRequests = friendIds.map(friendId => ({
            userId: currentUser.id,
            friendId: friendId,
            status: "pending" as const,
            createdAt: now,
            updatedAt: now,
        }));

        await db.insert(friends).values(friendRequests).onConflictDoNothing();
        return { success: true, count: friendRequests.length };
    });

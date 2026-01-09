import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ne, eq, and } from "drizzle-orm";
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

// get pending friend requests for current user
export const getPendingFriendRequests = createServerFn({ method: "GET" }).handler(
    async () => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const pendingRequests = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                email: users.email,
            })
            .from(friends)
            .innerJoin(users, eq(friends.userId, users.id))
            .where(
                and(
                    eq(friends.friendId, currentUser.id),
                    eq(friends.status, "pending")
                )
            );

        return pendingRequests;
    });

// accept friend request
export const acceptFriendRequest = createServerFn({ method: "POST" })
    .inputValidator((friendId: string) => friendId)
    .handler(async ({ data: friendId }) => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        await db.update(friends)
            .set({ status: "accepted", updatedAt: new Date() })
            .where(
                and(
                    eq(friends.userId, friendId),
                    eq(friends.friendId, currentUser.id)
                )
            );

        return { success: true };
    });

// reject friend request
export const rejectFriendRequest = createServerFn({ method: "POST" })
    .inputValidator((friendId: string) => friendId)
    .handler(async ({ data: friendId }) => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        await db.delete(friends)
            .where(
                and(
                    eq(friends.userId, friendId),
                    eq(friends.friendId, currentUser.id)
                )
            );

        return { success: true };
    });

// block friend request
export const blockFriendRequest = createServerFn({ method: "POST" })
    .inputValidator((friendId: string) => friendId)
    .handler(async ({ data: friendId }) => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        await db.update(friends)
            .set({ status: "blocked", updatedAt: new Date() })
            .where(
                and(
                    eq(friends.userId, friendId),
                    eq(friends.friendId, currentUser.id)
                )
            );

        return { success: true };
    });

// get accepted friends
export const getAcceptedFriends = createServerFn({ method: "GET" }).handler(
    async () => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const acceptedFriends = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                email: users.email,
            })
            .from(friends)
            .innerJoin(users, eq(friends.friendId, users.id))
            .where(
                and(
                    eq(friends.userId, currentUser.id),
                    eq(friends.status, "accepted")
                )
            );

        return acceptedFriends;
    });

// get pending friend requests sent by current user
export const getSentPendingFriendRequests = createServerFn({ method: "GET" }).handler(
    async () => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const sentPendingRequests = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                email: users.email,
            })
            .from(friends)
            .innerJoin(users, eq(friends.friendId, users.id))
            .where(
                and(
                    eq(friends.userId, currentUser.id),
                    eq(friends.status, "pending")
                )
            );

        return sentPendingRequests;
    });

// get blocked friend requests sent by current user
export const getSentBlockedFriendRequests = createServerFn({ method: "GET" }).handler(
    async () => {
        const currentUser = await getUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const sentBlockedRequests = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                email: users.email,
            })
            .from(friends)
            .innerJoin(users, eq(friends.friendId, users.id))
            .where(
                and(
                    eq(friends.userId, currentUser.id),
                    eq(friends.status, "blocked")
                )
            );

        return sentBlockedRequests;
    });

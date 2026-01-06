import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server"; import { ne } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "@/db/db";
import { users } from "@/db/schema";

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
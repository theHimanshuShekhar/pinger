import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "../auth";

// get user from session
export const getUser = createServerFn({ method: "GET" }).handler(async () => {
    const headers = new Headers(getRequest()?.headers ?? {});
    const session = await auth.api.getSession({ headers });
    return session?.user || null;
});
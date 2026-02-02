import { createRouter } from "@tanstack/react-router"
import { getCurrentUser } from "./lib/server/users"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"
import { QueryClient } from "@tanstack/react-query"

// Create a new router instance
export const getRouter = async () => {
    const user = await getCurrentUser();
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: true,
                staleTime: 1000 * 60 * 2, // 2 minutes
                refetchInterval: 1000 * 60 * 5, // 5 minutes
            },
        },
    });

    return createRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreloadStaleTime: 0,
        defaultPreload: "intent",
        context: {
            queryClient,
            user: user ?? null
        }
    })
}

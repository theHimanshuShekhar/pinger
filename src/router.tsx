import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

// Create router instance
export const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent",
    context: {
        user: null
    }
})

// Export getRouter for TanStack Start
export async function getRouter() {
    return router
}

// Declare module for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

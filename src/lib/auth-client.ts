import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "/api/auth"
})

// Export convenience methods
export const { signIn, signOut, useSession } = authClient

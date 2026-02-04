import { createAuthClient } from "better-auth/react"

// Client will automatically use the current domain
// since auth API is on the same origin at /api/auth
export const authClient = createAuthClient()

// Export convenience methods
export const { signIn, signOut, useSession } = authClient

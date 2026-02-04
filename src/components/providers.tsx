import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { Link, useRouter } from "@tanstack/react-router"
import {
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { useState } from "react"

import { authClient } from "@/lib/auth-client"
import { MetaTheme } from "./meta-theme"

export function Providers({ children }: { children: React.ReactNode }) {
    const { navigate } = useRouter()

    // Create QueryClient once using useState
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: true,
                        staleTime: 1000 * 60 * 2, // 2 minutes
                        refetchInterval: 1000 * 60 * 5 // 5 minutes
                    }
                }
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthUIProvider
                    authClient={authClient}
                    navigate={(href) => navigate({ href })}
                    replace={(href) => navigate({ href, replace: true })}
                    Link={({ href, ...props }) => (
                        <Link to={href} {...props} />
                    )}
                >
                    {children}
                    <MetaTheme />
                </AuthUIProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

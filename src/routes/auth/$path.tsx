import { AuthView, SignedIn, SignedOut } from "@daveyplate/better-auth-ui"
import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/$path")({
    component: RouteComponent
})

function RouteComponent() {
    const { path } = Route.useParams()

    return (
        <main className="container items-center flex flex-col mx-auto my-auto p-4 md:p-6">
            <SignedOut>
                <AuthView path={path} />
            </SignedOut>
            <SignedIn>
                <Navigate to="/" replace />
            </SignedIn>
        </main>
    )
}

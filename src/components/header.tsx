import { UserButton } from "@daveyplate/better-auth-ui"
import { Link } from "@tanstack/react-router"

import { UserCounter } from "./user-counter"

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background">
            <div className="container mx-auto flex h-14 items-center justify-between">
                {/* Left side: Branding - larger touch target for mobile */}
                <Link
                    to="/"
                    className="px-4 flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight transition-colors hover:text-primary py-2 px-1 -ml-1 rounded-lg hover:bg-accent/50"
                >
                    <span className="text-xl md:text-2xl">📡</span>
                    <span>Pinger!</span>
                    <UserCounter />
                </Link>

                {/* Right side: User button - icon on mobile, sm on desktop */}
                <div className="flex items-center">
                    <div className="md:hidden">
                        <UserButton size="icon" />
                    </div>
                    <div className="hidden md:block">
                        <UserButton size="sm" />
                    </div>
                </div>
            </div>
        </header>
    )
}

import { createFileRoute, redirect } from "@tanstack/react-router"
import { Calendar, Clock, Mail, User as UserIcon, Users } from "lucide-react"
import { getCurrentUser } from "@/lib/server/users"

export const Route = createFileRoute("/profile")({
    beforeLoad: async () => {
        const user = await getCurrentUser()
        if (!user) {
            throw redirect({ to: "/" })
        }
    },
    component: ProfilePage,
    loader: async () => {
        const user = await getCurrentUser()
        return { user }
    }
})

function ProfilePage() {
    const { user } = Route.useLoaderData()

    return (
        <div className="h-full w-full p-3 sm:p-4 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-3 sm:gap-4">
                {/* Top Row: Profile Info + Top Roommates */}
                <div className="flex-none grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Profile Info Card */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 sm:p-5 flex flex-col">
                        {/* Header with Avatar */}
                        <div className="text-center mb-3 sm:mb-4">
                            <div className="flex justify-center mb-2 sm:mb-3">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center text-2xl sm:text-3xl font-semibold border-2 border-border">
                                    {user!.image ? (
                                        <img
                                            src={user!.image}
                                            alt={user!.name}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        (user!.name
                                            ?.charAt(0)
                                            .toUpperCase() ?? (
                                            <UserIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                                        ))
                                    )}
                                </div>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold">
                                {user!.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {user!.email}
                            </p>
                        </div>

                        {/* Profile Details */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium">
                                        Email
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user!.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted">
                                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium">
                                        User ID
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user!.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium">
                                        Joined
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            user!.createdAt
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>

                            {user!.emailVerified && (
                                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-green-100 dark:bg-green-900">
                                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                    <p className="text-xs font-medium text-green-700 dark:text-green-300">
                                        Email Verified
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Roommates Section */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 sm:p-5 flex flex-col">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold">
                                    Top Roommates
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    By time shared
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3">
                                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm sm:text-base font-medium mb-1">
                                No room history yet
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] sm:max-w-[240px]">
                                Your top 5 users by duration shared in rooms
                                will appear here once you start connecting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Friends Section */}
                <div className="flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 sm:p-5 flex flex-col">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold">
                                Friends
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Coming soon
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm sm:text-base font-medium mb-1">
                            No friends yet
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-[200px] sm:max-w-[240px]">
                            Connect with other users to see them here. Friend
                            requests and connections coming in a future update.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

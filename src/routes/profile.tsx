import { createFileRoute, redirect } from "@tanstack/react-router"
import { Calendar, Clock, Mail, User as UserIcon, Users } from "lucide-react"
import { FriendItem } from "@/components/friend-item"
import { getFriends } from "@/lib/server/friendships"
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
        const [user, friends] = await Promise.all([
            getCurrentUser(),
            getFriends()
        ])
        return { user, friends }
    }
})

function ProfilePage() {
    const { user, friends } = Route.useLoaderData()

    return (
        <div className="h-full w-full p-2 sm:p-3 overflow-hidden">
            <div className="h-full flex flex-col gap-2 sm:gap-3">
                {/* Profile Info Card - compact, takes only needed space */}
                <div className="flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center text-xl sm:text-2xl font-semibold border-2 border-border flex-shrink-0">
                            {user!.image ? (
                                <img
                                    src={user!.image}
                                    alt={user!.name}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                (user!.name?.charAt(0).toUpperCase() ?? (
                                    <UserIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                                ))
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-bold truncate">
                                {user!.name}
                            </h1>
                            <p className="text-xs text-muted-foreground truncate">
                                {user!.email}
                            </p>
                        </div>
                    </div>

                    {/* Profile Details - compact horizontal layout */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium">Email</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user!.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                            <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium">User ID</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user!.id.slice(0, 8)}...
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium">Joined</p>
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
                    </div>

                    {user!.emailVerified && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900 w-fit">
                            <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                            <p className="text-xs font-medium text-green-700 dark:text-green-300">
                                Email Verified
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Roommates + Friends Grid - takes remaining space */}
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {/* Top Roommates Section */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold">
                                    Top Roommates
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    By time shared
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center min-h-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    No room history yet
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Friends Section - shows actual friends */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold">
                                    Friends
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {friends.length}{" "}
                                    {friends.length === 1
                                        ? "friend"
                                        : "friends"}
                                </p>
                            </div>
                        </div>

                        {friends.length > 0 ? (
                            <div className="flex-1 min-h-0 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div className="flex flex-row gap-2 p-1">
                                    {friends.map((friend) => (
                                        <FriendItem
                                            key={friend.friendship.id}
                                            friend={friend.friend}
                                            size="compact"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center min-h-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        No friends yet
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

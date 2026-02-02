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
        <div className="h-full w-full p-4 overflow-hidden">
            <div className="w-full h-full flex flex-col gap-4">
                {/* Top Row: Profile Info + Top Roommates */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                    {/* Profile Info Card */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 overflow-auto">
                        {/* Header with Avatar */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl font-semibold border-2 border-border">
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
                                            <UserIcon className="h-10 w-10" />
                                        ))
                                    )}
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold">{user!.name}</h1>
                            <p className="text-muted-foreground">
                                {user!.email}
                            </p>
                        </div>

                        {/* Profile Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user!.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        User ID
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user!.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Joined
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            user!.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {user!.emailVerified && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Email Verified
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Roommates Section */}
                    <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 overflow-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Top Roommates
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    By time shared
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                No room history yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Your top 5 users by duration shared in rooms
                                will appear here once you start connecting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Friends Section */}
                <div className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 overflow-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Friends</h2>
                            <p className="text-sm text-muted-foreground">
                                Coming soon
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            No friends yet
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Connect with other users to see them here. Friend
                            requests and connections coming in a future update.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

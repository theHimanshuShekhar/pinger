import { createFileRoute, redirect } from "@tanstack/react-router"
import {
    Ban,
    Check,
    Clock,
    Search,
    User as UserIcon,
    UserPlus
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getAllUsers,
    searchUsers,
    sendFriendRequest
} from "@/lib/server/friendships"
import { getCurrentUser } from "@/lib/server/users"

export const Route = createFileRoute("/users")({
    beforeLoad: async () => {
        const user = await getCurrentUser()
        if (!user) {
            throw redirect({ to: "/" })
        }
    },
    component: UsersPage,
    loader: async () => {
        const users = await getAllUsers()
        return { users }
    }
})

interface User {
    id: string
    name: string
    email: string
    image: string | null
}

function UsersPage() {
    const { users: initialUsers } = Route.useLoaderData()
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [searchQuery, setSearchQuery] = useState("")
    const [sendingRequest, setSendingRequest] = useState<string | null>(null)
    const [friendshipStatuses, setFriendshipStatuses] = useState<
        Record<string, { status: string; senderId?: string }>
    >({})

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (!query.trim()) {
            const allUsers = await getAllUsers()
            setUsers(allUsers)
        } else {
            const foundUsers = await searchUsers({ data: { q: query } })
            setUsers(foundUsers)
        }
    }

    const handleSendRequest = async (userId: string) => {
        setSendingRequest(userId)
        try {
            await sendFriendRequest({ data: { receiverId: userId } })
            setFriendshipStatuses((prev) => ({
                ...prev,
                [userId]: { status: "pending" }
            }))
        } catch (error) {
            console.error("Failed to send friend request:", error)
        } finally {
            setSendingRequest(null)
        }
    }

    const getFriendshipStatusDisplay = (userId: string) => {
        const status = friendshipStatuses[userId]?.status
        if (status === "pending") {
            return { icon: Clock, text: "Pending", color: "text-yellow-500" }
        }
        if (status === "accepted") {
            return { icon: Check, text: "Friends", color: "text-green-500" }
        }
        if (status === "blocked") {
            return { icon: Ban, text: "Blocked", color: "text-red-500" }
        }
        return null
    }

    return (
        <div className="h-full w-full p-4 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-4">
                {/* Header */}
                <div className="bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Find Users</h1>
                            <p className="text-sm text-muted-foreground">
                                Search and connect with other users
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 overflow-auto">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                No users found
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Try adjusting your search terms
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => {
                                const statusDisplay =
                                    getFriendshipStatusDisplay(user.id)
                                const isSending = sendingRequest === user.id

                                return (
                                    <div
                                        key={user.id}
                                        className="bg-muted rounded-lg p-4 flex items-center gap-4"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">
                                                {user.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        {statusDisplay ? (
                                            <div
                                                className={`flex items-center gap-1 text-sm ${statusDisplay.color}`}
                                            >
                                                <statusDisplay.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {statusDisplay.text}
                                                </span>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleSendRequest(user.id)
                                                }
                                                disabled={isSending}
                                            >
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                <span className="hidden sm:inline">
                                                    Add
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

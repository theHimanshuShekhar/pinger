import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import {
    Ban,
    Check,
    Clock,
    Loader2,
    Search,
    User as UserIcon,
    UserPlus
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getAllUsers,
    getFriendshipStatusesForUsers,
    searchUsers,
    sendFriendRequest
} from "@/lib/server/friendships"
import { getCurrentUser } from "@/lib/server/users"

const USERS_QUERY_KEY = "users"
const FRIENDSHIP_STATUSES_QUERY_KEY = "friendship-statuses"

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
    const queryClient = useQueryClient()
    const { users: initialUsers } = Route.useLoaderData()
    const [searchQuery, setSearchQuery] = useState("")

    // Use React Query for users with initial data from loader
    const { data: users = initialUsers } = useQuery({
        queryKey: [USERS_QUERY_KEY, searchQuery],
        queryFn: async () => {
            if (!searchQuery.trim()) {
                return getAllUsers()
            }
            return searchUsers({ data: { q: searchQuery } })
        },
        initialData: searchQuery ? undefined : initialUsers
    })

    // Fetch friendship statuses for all users
    const { data: friendshipStatuses = {}, isLoading: isLoadingStatuses } =
        useQuery({
            queryKey: [
                FRIENDSHIP_STATUSES_QUERY_KEY,
                users.map((u) => u.id).join(",")
            ],
            queryFn: async () => {
                if (users.length === 0) return {}
                const userIds = users.map((user) => user.id)
                return getFriendshipStatusesForUsers({ data: { userIds } })
            },
            enabled: users.length > 0
        })

    // Mutation for sending friend requests
    const sendRequestMutation = useMutation({
        mutationFn: async (receiverId: string) => {
            await sendFriendRequest({ data: { receiverId } })
        },
        onSuccess: (_, receiverId) => {
            // Update local cache
            queryClient.setQueryData(
                [
                    FRIENDSHIP_STATUSES_QUERY_KEY,
                    users.map((u) => u.id).join(",")
                ],
                (
                    old: Record<
                        string,
                        { status: string; senderId?: string }
                    > = {}
                ) => ({
                    ...old,
                    [receiverId]: { status: "pending" }
                })
            )
            // Invalidate to refresh from server
            queryClient.invalidateQueries({
                queryKey: [FRIENDSHIP_STATUSES_QUERY_KEY]
            })
        }
    })

    const handleSearch = (query: string) => {
        setSearchQuery(query)
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

    // Render loading state while friendship statuses are loading
    const renderFriendshipAction = (userId: string) => {
        // Show loading spinner while fetching statuses
        if (isLoadingStatuses) {
            return (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            )
        }

        const statusDisplay = getFriendshipStatusDisplay(userId)
        const isSending =
            sendRequestMutation.isPending &&
            sendRequestMutation.variables === userId

        if (statusDisplay) {
            return (
                <div
                    className={`flex items-center gap-1 text-sm ${statusDisplay.color}`}
                >
                    <statusDisplay.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        {statusDisplay.text}
                    </span>
                </div>
            )
        }

        return (
            <Button
                size="sm"
                onClick={() => sendRequestMutation.mutate(userId)}
                disabled={isSending}
            >
                <UserPlus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add</span>
            </Button>
        )
    }

    return (
        <div className="h-full w-full p-2 sm:p-3 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-2 sm:gap-3">
                {/* Header - flex-none so it only takes needed space */}
                <div className="flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">
                                Find Users
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
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
                            className="pl-10 h-9 sm:h-10"
                        />
                    </div>
                </div>

                {/* Users List - shrinks when empty, expands when has content */}
                <div
                    className={`bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4 overflow-hidden flex flex-col ${users.length === 0 ? "flex-none h-auto" : "flex-1 min-h-0"}`}
                >
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm sm:text-base font-medium">
                                No users found
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Try adjusting your search terms
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-x-auto scrollbar-hide flex flex-nowrap gap-3 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-muted rounded-lg p-2 sm:p-3 flex flex-col items-center gap-2 flex-shrink-0 w-28 sm:w-32"
                                >
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="text-center min-w-0 w-full">
                                        <h3 className="text-xs sm:text-sm font-medium truncate">
                                            {user.name}
                                        </h3>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="mt-1">
                                        {renderFriendshipAction(user.id)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

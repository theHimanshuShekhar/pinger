import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Activity, Check, Radio, UserPlus, Users, X } from "lucide-react"
import { useState } from "react"
import { FriendItem } from "@/components/friend-item"
import { Button } from "@/components/ui/button"
import {
    getFriends,
    getPendingFriendRequests,
    respondToFriendRequest
} from "@/lib/server/friendships"

const PENDING_REQUESTS_QUERY_KEY = "pending-requests"
const FRIENDS_QUERY_KEY = "friends"

export const Route = createFileRoute("/")({
    component: IndexPage,
    loader: async () => {
        const [pendingRequests, friends] = await Promise.all([
            getPendingFriendRequests(),
            getFriends()
        ])
        return { pendingRequests, friends }
    }
})

function FriendRequestItem({
    request
}: {
    request: Awaited<ReturnType<typeof getPendingFriendRequests>>[number]
}) {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)

    const respondMutation = useMutation({
        mutationFn: async (action: "accept" | "deny") => {
            await respondToFriendRequest({
                data: { friendshipId: request.friendship.id, action }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [PENDING_REQUESTS_QUERY_KEY]
            })
            queryClient.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY] })
        },
        onSettled: () => {
            setIsLoading(false)
        }
    })

    const handleAction = async (action: "accept" | "deny") => {
        setIsLoading(true)
        respondMutation.mutate(action)
    }

    return (
        <div className="flex flex-col items-center p-3 bg-background rounded-lg shadow-sm border border-border min-w-[140px]">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-2">
                {request.sender.image ? (
                    <img
                        src={request.sender.image}
                        alt={request.sender.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <Users className="h-5 w-5 text-primary" />
                )}
            </div>
            <div className="text-center min-w-0 w-full mb-2">
                <p className="font-medium truncate text-sm">
                    {request.sender.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {request.sender.email}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => handleAction("accept")}
                    disabled={isLoading}
                >
                    <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => handleAction("deny")}
                    disabled={isLoading}
                >
                    <X className="h-3 w-3 text-red-600" />
                </Button>
            </div>
        </div>
    )
}

function IndexPage() {
    const loaderData = Route.useLoaderData()

    const { pendingRequests: initialPending, friends: initialFriends } =
        loaderData

    const { data: pendingRequests = [] } = useQuery({
        queryKey: [PENDING_REQUESTS_QUERY_KEY],
        queryFn: getPendingFriendRequests,
        initialData: initialPending || [],
        staleTime: 1000 * 30
    })

    const { data: friends = [] } = useQuery({
        queryKey: [FRIENDS_QUERY_KEY],
        queryFn: getFriends,
        initialData: initialFriends || [],
        staleTime: 1000 * 30
    })

    return (
        <div className="h-full w-full flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 overflow-hidden">
            {/* Create Ping Button */}
            <section className="container mx-auto flex-none">
                <Button
                    size="lg"
                    className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all bg-primary"
                >
                    <Radio className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Ping
                </Button>
            </section>

            {/* Current Pings - very compact when empty */}
            <section className="container mx-auto flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm sm:text-base font-semibold">
                            Current Pings
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            No active conversations
                        </p>
                    </div>
                </div>
            </section>

            {/* Friend Requests and Current Friends - side by side on md+ */}
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Friend Requests - very compact when empty */}
                <section className="flex flex-col flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold">
                                    Friend Requests
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {pendingRequests.length} pending{" "}
                                    {pendingRequests.length === 1
                                        ? "request"
                                        : "requests"}
                                </p>
                            </div>
                        </div>
                        <Link to="/users">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 sm:h-8 text-xs sm:text-sm"
                            >
                                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Add
                            </Button>
                        </Link>
                    </div>
                    {pendingRequests.length > 0 && (
                        <div className="mt-2 bg-muted rounded-lg overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="flex flex-row gap-3 p-3">
                                {pendingRequests.map((request) => (
                                    <FriendRequestItem
                                        key={request.friendship.id}
                                        request={request}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Current Friends - very compact when empty */}
                <section className="flex flex-col flex-none bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-semibold">
                                Current Friends
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {friends.length}{" "}
                                {friends.length === 1 ? "friend" : "friends"}
                            </p>
                        </div>
                    </div>
                    {friends.length > 0 ? (
                        <div className="bg-muted rounded-lg overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="flex flex-row gap-3 p-3">
                                {friends.map((friend) => (
                                    <FriendItem
                                        key={friend.friendship.id}
                                        friend={friend.friend}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted rounded-lg py-2 px-4">
                            <p className="text-xs text-muted-foreground">
                                No friends yet
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

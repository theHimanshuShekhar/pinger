import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Activity, Check, Radio, UserPlus, Users, X } from "lucide-react"
import { useState } from "react"
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
            // Invalidate queries to refresh data automatically
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
        <div className="flex items-center justify-between p-3 bg-background rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                <div className="min-w-0">
                    <p className="font-medium truncate">
                        {request.sender.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {request.sender.email}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleAction("accept")}
                    disabled={isLoading}
                >
                    <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleAction("deny")}
                    disabled={isLoading}
                >
                    <X className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    )
}

function FriendRequestsList({
    requests
}: {
    requests: Awaited<ReturnType<typeof getPendingFriendRequests>>
}) {
    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No requests</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Friend requests will appear here
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 p-2">
            {requests.map((request) => (
                <FriendRequestItem
                    key={request.friendship.id}
                    request={request}
                />
            ))}
        </div>
    )
}

function FriendItem({
    friend
}: {
    friend: Awaited<ReturnType<typeof getFriends>>[number]
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg shadow-sm border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {friend.friend.image ? (
                    <img
                        src={friend.friend.image}
                        alt={friend.friend.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <Users className="h-5 w-5 text-primary" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{friend.friend.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {friend.friend.email}
                </p>
            </div>
        </div>
    )
}

function FriendsList({
    friends
}: {
    friends: Awaited<ReturnType<typeof getFriends>>
}) {
    if (friends.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Your friends will appear here once you connect
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 p-2">
            {friends.map((friend) => (
                <FriendItem key={friend.friendship.id} friend={friend} />
            ))}
        </div>
    )
}

function IndexPage() {
    const loaderData = Route.useLoaderData()

    const { pendingRequests: initialPending, friends: initialFriends } =
        loaderData

    // Use React Query to fetch and cache data with automatic refetching
    const { data: pendingRequests = [] } = useQuery({
        queryKey: [PENDING_REQUESTS_QUERY_KEY],
        queryFn: getPendingFriendRequests,
        initialData: initialPending || [],
        staleTime: 1000 * 30 // 30 seconds
    })

    const { data: friends = [] } = useQuery({
        queryKey: [FRIENDS_QUERY_KEY],
        queryFn: getFriends,
        initialData: initialFriends || [],
        staleTime: 1000 * 30 // 30 seconds
    })

    return (
        <div className="h-full w-full flex flex-col gap-4 p-4">
            {/* Create Ping Button - Always 1/10th (flex-1), Mobile: order 2, Desktop: order 1 */}
            <section className="container mx-auto flex-1 order-2 md:order-1 min-h-0">
                <Button
                    size="lg"
                    className="w-full h-full text-lg font-semibold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all bg-primary"
                >
                    <Radio className="h-5 w-5 mr-2" />
                    Create Ping
                </Button>
            </section>

            {/* Current Pings - Always 4.5/10ths (flex-[9]), Mobile: order 1, Desktop: order 2 */}
            <section className="container mx-auto flex-[9] order-1 md:order-2 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 flex flex-col min-h-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Current Pings</h2>
                        <p className="text-sm text-muted-foreground">
                            Active conversations
                        </p>
                    </div>
                </div>
                <div className="flex-1 bg-muted rounded-lg overflow-auto">
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                            <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            No active pings
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Start a new ping to see it here
                        </p>
                    </div>
                </div>
            </section>

            {/* Mobile: Friend Requests - 4.5/10ths (flex-[9]), full width, order 3 */}
            <section className="container mx-auto flex-[9] md:hidden bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 flex flex-col order-3 min-h-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">
                            Friend Requests
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Pending invitations
                        </p>
                    </div>
                </div>
                <div className="flex-1 bg-muted rounded-lg overflow-auto min-h-[200px]">
                    <FriendRequestsList requests={pendingRequests} />
                </div>
            </section>

            {/* Desktop: Friends + Friend Requests side by side - 4.5/10ths total (flex-[9]), order 3 */}
            <div className="container mx-auto hidden md:flex flex-[9] flex-row gap-4 md:order-3 min-h-0">
                {/* Current Friends - Half of 4.5/10ths */}
                <section className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 flex flex-col min-h-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">
                                Current Friends
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Your connections
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 bg-muted rounded-lg overflow-auto min-h-[200px]">
                        <FriendsList friends={friends} />
                    </div>
                </section>

                {/* Friend Requests - Half of 4.5/10ths */}
                <section className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Friend Requests
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Pending invitations
                                </p>
                            </div>
                        </div>
                        <Link to="/users">
                            <Button size="sm" variant="outline">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Friends
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1 bg-muted rounded-lg overflow-auto min-h-[200px]">
                        <FriendRequestsList requests={pendingRequests} />
                    </div>
                </section>
            </div>
        </div>
    )
}

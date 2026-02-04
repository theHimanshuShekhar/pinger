import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
    Activity,
    Check,
    Clock,
    Gamepad2,
    LogOut,
    Radio,
    UserPlus,
    Users,
    X
} from "lucide-react"
import { useState } from "react"
import { FriendItem } from "@/components/friend-item"
import { Button } from "@/components/ui/button"
import {
    getFriends,
    getPendingFriendRequests,
    respondToFriendRequest
} from "@/lib/server/friendships"
import { getActivePings, respondToPingInvite } from "@/lib/server/pings"
import { getCurrentUser } from "@/lib/server/users"

const PENDING_REQUESTS_QUERY_KEY = "pending-requests"
const FRIENDS_QUERY_KEY = "friends"
const PINGS_QUERY_KEY = "pings"

export const Route = createFileRoute("/")({
    component: IndexPage,
    beforeLoad: async () => {
        const user = await getCurrentUser()
        if (!user) {
            throw redirect({ to: "/auth/$path", params: { path: "login" } })
        }
    },
    loader: async () => {
        const [pendingRequests, friends, pings] = await Promise.all([
            getPendingFriendRequests(),
            getFriends(),
            getActivePings()
        ])
        return { pendingRequests, friends, pings }
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
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-border min-w-[140px]">
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

function formatDateTime(dateStr: string | Date | null) {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    })
}

function IndexPage() {
    const queryClient = useQueryClient()
    const loaderData = Route.useLoaderData()

    const {
        pendingRequests: initialPending,
        friends: initialFriends,
        pings: initialPings
    } = loaderData

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

    const { data: pingsData } = useQuery({
        queryKey: [PINGS_QUERY_KEY],
        queryFn: getActivePings,
        initialData: initialPings,
        staleTime: 1000 * 30
    })

    const createdPings = pingsData?.created || []
    const invitedPings = pingsData?.invited || []
    const totalActivePings = createdPings.length + invitedPings.length

    // Mutation for responding to ping invites
    const respondToPingMutation = useMutation({
        mutationFn: async ({
            pingId,
            action
        }: {
            pingId: string
            action: "accept" | "decline"
        }) => {
            await respondToPingInvite({ data: { pingId, action } })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PINGS_QUERY_KEY] })
        }
    })

    const handlePingResponse = async (
        pingId: string,
        action: "accept" | "decline",
        e: React.MouseEvent
    ) => {
        e.preventDefault()
        e.stopPropagation()
        respondToPingMutation.mutate({ pingId, action })
    }

    return (
        <div className="h-full w-full p-2 sm:p-3 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-2 sm:gap-3">
                {/* Create Ping Button */}
                <section className="flex-none">
                    <Link to="/ping/create">
                        <Button
                            size="lg"
                            className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all bg-primary"
                        >
                            <Radio className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Create Ping
                        </Button>
                    </Link>
                </section>

                {/* Current Pings */}
                <section className="flex-none bg-muted rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm sm:text-base font-semibold">
                                Current Pings
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {totalActivePings === 0
                                    ? "No active conversations"
                                    : `${totalActivePings} active ping${totalActivePings !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>

                    {totalActivePings > 0 && (
                        <div className="mt-3 -mx-1 overflow-y-auto max-h-[280px] scrollbar-hide">
                            <div className="space-y-2 px-1 pb-1">
                                {/* Created Pings */}
                                {createdPings.map((ping: any) => (
                                    <div
                                        key={ping.id}
                                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        {/* Leave button positioned absolutely */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 z-10 h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            onClick={(e) =>
                                                handlePingResponse(
                                                    ping.id,
                                                    "decline",
                                                    e
                                                )
                                            }
                                            disabled={
                                                respondToPingMutation.isPending
                                            }
                                        >
                                            <LogOut className="h-3 w-3 mr-1" />
                                            Leave
                                        </Button>

                                        <Link
                                            to={`/ping/${ping.id}`}
                                            className="block p-3"
                                        >
                                            {/* Decorative top accent */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-xl" />

                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0 pr-20">
                                                    {/* Header with game icon and name */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                                            <Gamepad2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">
                                                                {ping.game ||
                                                                    "General Hangout"}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {ping.scheduledEndAt
                                                                        ? `${formatDateTime(ping.scheduledAt)} - ${formatDateTime(ping.scheduledEndAt)}`
                                                                        : formatDateTime(
                                                                              ping.scheduledAt
                                                                          ) ||
                                                                          "Now"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Message */}
                                                    {ping.message && (
                                                        <p className="text-xs text-muted-foreground mb-3 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1.5 border border-border/50">
                                                            {ping.message}
                                                        </p>
                                                    )}

                                                    {/* Participants - Stacked avatars */}
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2">
                                                            {ping.participants
                                                                ?.slice(0, 4)
                                                                .map(
                                                                    (
                                                                        participant: any,
                                                                        idx: number
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                participant
                                                                                    .user
                                                                                    .id
                                                                            }
                                                                            className="relative"
                                                                            style={{
                                                                                zIndex:
                                                                                    10 -
                                                                                    idx
                                                                            }}
                                                                            title={`${participant.user.name} - ${participant.status}`}
                                                                        >
                                                                            <div
                                                                                className={`h-8 w-8 rounded-full border-2 ${participant.status === "accepted" ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-amber-400 ring-2 ring-amber-400/20"} bg-background overflow-hidden`}
                                                                            >
                                                                                {participant
                                                                                    .user
                                                                                    .image ? (
                                                                                    <img
                                                                                        src={
                                                                                            participant
                                                                                                .user
                                                                                                .image
                                                                                        }
                                                                                        alt={
                                                                                            participant
                                                                                                .user
                                                                                                .name
                                                                                        }
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="h-full w-full bg-muted flex items-center justify-center">
                                                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {participant.isCreator && (
                                                                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                                                                                    <span className="text-[6px] font-bold text-primary-foreground">
                                                                                        C
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            {ping.participants
                                                                ?.length >
                                                                4 && (
                                                                <div className="h-8 w-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                                    +
                                                                    {ping
                                                                        .participants
                                                                        .length -
                                                                        4}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-3 flex flex-col text-xs">
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                {
                                                                    ping.participants?.filter(
                                                                        (
                                                                            p: any
                                                                        ) =>
                                                                            p.status ===
                                                                            "accepted"
                                                                    ).length
                                                                }{" "}
                                                                joined
                                                            </span>
                                                            <span className="text-amber-600 dark:text-amber-400">
                                                                {
                                                                    ping.participants?.filter(
                                                                        (
                                                                            p: any
                                                                        ) =>
                                                                            p.status ===
                                                                            "pending"
                                                                    ).length
                                                                }{" "}
                                                                pending
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status badge */}
                                                <div
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${ping.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}
                                                >
                                                    {ping.status === "active"
                                                        ? "● Active"
                                                        : "○ Pending"}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                {/* Invited Pings */}
                                {invitedPings.map((ping: any) => (
                                    <div
                                        key={ping.id}
                                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        {/* Accept/Decline buttons positioned absolutely */}
                                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                                            <Button
                                                size="sm"
                                                className="h-7 px-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800"
                                                onClick={(e) =>
                                                    handlePingResponse(
                                                        ping.id,
                                                        "accept",
                                                        e
                                                    )
                                                }
                                                disabled={
                                                    respondToPingMutation.isPending
                                                }
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                onClick={(e) =>
                                                    handlePingResponse(
                                                        ping.id,
                                                        "decline",
                                                        e
                                                    )
                                                }
                                                disabled={
                                                    respondToPingMutation.isPending
                                                }
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <Link
                                            to={`/ping/${ping.id}`}
                                            className="block p-3"
                                        >
                                            {/* Decorative top accent */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-t-xl" />

                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0 pr-24">
                                                    {/* Header with game icon and name */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                            <Gamepad2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">
                                                                {ping.game ||
                                                                    "General Hangout"}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {ping.scheduledEndAt
                                                                        ? `${formatDateTime(ping.scheduledAt)} - ${formatDateTime(ping.scheduledEndAt)}`
                                                                        : formatDateTime(
                                                                              ping.scheduledAt
                                                                          ) ||
                                                                          "Now"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Message */}
                                                    {ping.message && (
                                                        <p className="text-xs text-muted-foreground mb-3 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1.5 border border-border/50">
                                                            {ping.message}
                                                        </p>
                                                    )}

                                                    {/* Invited by */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-6 w-6 rounded-full border-2 border-blue-400 bg-background overflow-hidden">
                                                            {ping.creator
                                                                ?.image ? (
                                                                <img
                                                                    src={
                                                                        ping
                                                                            .creator
                                                                            .image
                                                                    }
                                                                    alt={
                                                                        ping
                                                                            .creator
                                                                            .name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Invited by{" "}
                                                            <span className="font-medium text-foreground">
                                                                {
                                                                    ping.creator
                                                                        ?.name
                                                                }
                                                            </span>
                                                        </span>
                                                    </div>

                                                    {/* Participants - Stacked avatars */}
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2">
                                                            {ping.participants
                                                                ?.slice(0, 4)
                                                                .map(
                                                                    (
                                                                        participant: any,
                                                                        idx: number
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                participant
                                                                                    .user
                                                                                    .id
                                                                            }
                                                                            className="relative"
                                                                            style={{
                                                                                zIndex:
                                                                                    10 -
                                                                                    idx
                                                                            }}
                                                                            title={`${participant.user.name} - ${participant.status}`}
                                                                        >
                                                                            <div
                                                                                className={`h-8 w-8 rounded-full border-2 ${participant.status === "accepted" ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-amber-400 ring-2 ring-amber-400/20"} bg-background overflow-hidden`}
                                                                            >
                                                                                {participant
                                                                                    .user
                                                                                    .image ? (
                                                                                    <img
                                                                                        src={
                                                                                            participant
                                                                                                .user
                                                                                                .image
                                                                                        }
                                                                                        alt={
                                                                                            participant
                                                                                                .user
                                                                                                .name
                                                                                        }
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="h-full w-full bg-muted flex items-center justify-center">
                                                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {participant.isCreator && (
                                                                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                                                                                    <span className="text-[6px] font-bold text-primary-foreground">
                                                                                        C
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            {ping.participants
                                                                ?.length >
                                                                4 && (
                                                                <div className="h-8 w-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                                    +
                                                                    {ping
                                                                        .participants
                                                                        .length -
                                                                        4}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-3 flex flex-col text-xs">
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                {
                                                                    ping.participants?.filter(
                                                                        (
                                                                            p: any
                                                                        ) =>
                                                                            p.status ===
                                                                            "accepted"
                                                                    ).length
                                                                }{" "}
                                                                joined
                                                            </span>
                                                            <span className="text-amber-600 dark:text-amber-400">
                                                                {
                                                                    ping.participants?.filter(
                                                                        (
                                                                            p: any
                                                                        ) =>
                                                                            p.status ===
                                                                            "pending"
                                                                    ).length
                                                                }{" "}
                                                                pending
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Friend Requests and Current Friends - side by side on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {/* Friend Requests - very compact when empty */}
                    <section className="flex flex-col flex-none bg-muted rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4">
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
                                    className="h-7 sm:h-8 px-2 sm:px-3"
                                >
                                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Friend
                                </Button>
                            </Link>
                        </div>
                        {pendingRequests.length > 0 && (
                            <div className="mt-2 bg-background rounded-lg border border-border overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    <section className="flex flex-col flex-none bg-muted rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold">
                                    Current Friends
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
                            <div className="mt-2 bg-background rounded-lg border border-border overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                            <div className="mt-2 bg-background rounded-lg border border-border py-2 px-4">
                                <p className="text-xs text-muted-foreground">
                                    No friends yet
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

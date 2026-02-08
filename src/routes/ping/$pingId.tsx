import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { ArrowLeft, Gamepad2, MessageSquare, Users } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getActivePings } from "@/lib/server/pings"

const PINGS_QUERY_KEY = "pings"

export const Route = createFileRoute("/ping/$pingId")({
    component: PingChatPage,
    loader: async ({ params }) => {
        const pings = await getActivePings()
        const allPings = [...pings.created, ...pings.invited]
        const ping = allPings.find((p: any) => p.id === params.pingId)
        return { ping }
    }
})

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

function PingChatPage() {
    const { pingId } = useParams({ from: "/ping/$pingId" })
    const { ping: initialPing } = Route.useLoaderData()
    const [showCopied, setShowCopied] = useState(false)

    const { data: pingsData } = useQuery({
        queryKey: [PINGS_QUERY_KEY],
        queryFn: getActivePings,
        initialData: { created: [], invited: [] },
        staleTime: 1000 * 30
    })

    // Find the current ping from fresh data or use initial
    const allPings = [
        ...(pingsData?.created || []),
        ...(pingsData?.invited || [])
    ]
    const ping = allPings.find((p: any) => p.id === pingId) || initialPing

    if (!ping) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Ping not found</p>
                    <Link to="/">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const handleCopyLink = () => {
        const url = `${window.location.origin}/ping/${pingId}`
        navigator.clipboard.writeText(url)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
    }

    return (
        <div className="h-full w-full p-2 sm:p-3 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-2 sm:gap-3 max-w-3xl">
                {/* Header */}
                <div className="flex-none bg-muted rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link to="/">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm sm:text-base font-semibold truncate">
                                {ping.game || "General Hangout"}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {ping.scheduledEndAt
                                    ? `${formatDateTime(ping.scheduledAt)} - ${formatDateTime(ping.scheduledEndAt)}`
                                    : formatDateTime(ping.scheduledAt) || "Now"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ping Info Card */}
                <div className="flex-none bg-card rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {ping.message && (
                                <p className="text-sm text-muted-foreground mb-3">
                                    {ping.message}
                                </p>
                            )}

                            {/* Participants */}
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div className="flex -space-x-2">
                                    {ping.participants
                                        ?.slice(0, 5)
                                        .map(
                                            (participant: any, idx: number) => (
                                                <div
                                                    key={participant.user.id}
                                                    className="relative"
                                                    style={{ zIndex: 10 - idx }}
                                                    title={`${participant.user.name} - ${participant.status}`}
                                                >
                                                    <div
                                                        className={`h-8 w-8 rounded-full border-2 ${participant.status === "accepted" ? "border-green-500" : "border-yellow-500"} bg-background overflow-hidden`}
                                                    >
                                                        {participant.user
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
                                    {ping.participants?.length > 5 && (
                                        <div className="h-8 w-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                            +{ping.participants.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {
                                        ping.participants?.filter(
                                            (p: any) => p.status === "accepted"
                                        ).length
                                    }{" "}
                                    joined
                                    <span className="mx-1">•</span>
                                    {
                                        ping.participants?.filter(
                                            (p: any) => p.status === "pending"
                                        ).length
                                    }{" "}
                                    pending
                                </span>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                ping.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                            }`}
                        >
                            {ping.status === "active"
                                ? "● Active"
                                : "○ Pending"}
                        </div>
                    </div>
                </div>

                {/* Chat Coming Soon */}
                <div className="flex-1 min-h-0 bg-card rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border overflow-hidden flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">
                            Real-time chat coming soon
                        </p>
                        <p className="text-sm text-center mb-6 max-w-md">
                            We're working on adding real-time chat functionality
                            to make it easier to coordinate with your friends.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleCopyLink}>
                                {showCopied ? "Copied!" : "Copy Ping Link"}
                            </Button>
                            <Link to="/">
                                <Button>Back to Home</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

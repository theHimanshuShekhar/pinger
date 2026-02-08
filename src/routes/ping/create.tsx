import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Gamepad2,
    MessageSquare,
    Radio,
    Users
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFriends } from "@/lib/server/friendships"
import { createPing } from "@/lib/server/pings"
import { cn } from "@/lib/utils"

const POPULAR_GAMES = [
    "League of Legends",
    "Valorant",
    "Counter-Strike 2",
    "Minecraft",
    "Fortnite",
    "Apex Legends",
    "Call of Duty",
    "Rocket League",
    "Overwatch 2",
    "Dota 2",
    "Among Us",
    "Fall Guys"
]

const FRIENDS_QUERY_KEY = "friends"

export const Route = createFileRoute("/ping/create")({
    component: CreatePingPage,
    loader: async () => {
        const friends = await getFriends()
        return { friends }
    }
})

function CreatePingPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { friends: initialFriends } = Route.useLoaderData()

    const { data: friends = [] } = useQuery({
        queryKey: [FRIENDS_QUERY_KEY],
        queryFn: getFriends,
        initialData: initialFriends || [],
        staleTime: 1000 * 30
    })

    const [message, setMessage] = useState("")
    const [game, setGame] = useState("")
    const [customGame, setCustomGame] = useState("")
    const [selectedFriends, setSelectedFriends] = useState<string[]>([])
    const [timeMode, setTimeMode] = useState<"single" | "range">("single")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    const createPingMutation = useMutation({
        mutationFn: async () => {
            const finalGame = game === "custom" ? customGame : game
            return (createPing as any)({
                data: {
                    message: message || undefined,
                    game: finalGame || undefined,
                    scheduledAt: startTime || undefined,
                    scheduledEndAt:
                        timeMode === "range" && endTime ? endTime : undefined,
                    invitedUserIds: selectedFriends
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pings"] })
            router.navigate({ to: "/" })
        }
    })

    const toggleFriend = (friendId: string) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        )
    }

    const selectAllFriends = () => {
        if (selectedFriends.length === friends.length) {
            setSelectedFriends([])
        } else {
            setSelectedFriends(
                friends.map((f: { friend: { id: string } }) => f.friend.id)
            )
        }
    }

    const handleSetNow = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        setStartTime(now.toISOString().slice(0, 16))
    }

    const canSubmit =
        selectedFriends.length > 0 && !createPingMutation.isPending

    return (
        <div className="h-full w-full p-2 sm:p-3 overflow-hidden">
            <div className="container mx-auto h-full flex flex-col gap-2 sm:gap-3 max-w-2xl">
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
                            <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-semibold">
                                Create New Ping
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Invite friends to hang out
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 min-h-0 bg-muted rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-2 border-border p-3 sm:p-4 overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        {/* Game Selector */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Gamepad2 className="h-4 w-4" />
                                Game (Optional)
                            </label>
                            <select
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select a game...</option>
                                {POPULAR_GAMES.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                                <option value="custom">Other (custom)</option>
                            </select>
                            {game === "custom" && (
                                <Input
                                    placeholder="Enter game name"
                                    value={customGame}
                                    onChange={(e) =>
                                        setCustomGame(e.target.value)
                                    }
                                    className="mt-2"
                                />
                            )}
                            {game && game !== "custom" && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {game}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <MessageSquare className="h-4 w-4" />
                                Message (Optional)
                            </label>
                            <textarea
                                placeholder="What's the plan?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {message.length}/500
                            </p>
                        </div>

                        {/* Friends Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Users className="h-4 w-4" />
                                    Invite Friends
                                    <span className="text-xs text-muted-foreground font-normal">
                                        ({selectedFriends.length} selected)
                                    </span>
                                </label>
                                {friends.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={selectAllFriends}
                                        className="h-6 text-xs"
                                    >
                                        {selectedFriends.length ===
                                        friends.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </Button>
                                )}
                            </div>

                            {friends.length === 0 ? (
                                <div className="bg-background rounded-lg border border-border p-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No friends yet. Add friends first!
                                    </p>
                                    <Link
                                        to="/users"
                                        className="mt-2 inline-block"
                                    >
                                        <Button size="sm">Find Friends</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-background rounded-lg border border-border p-3">
                                    <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide pb-2">
                                        {friends.map(
                                            (friendship: {
                                                friend: {
                                                    id: string
                                                    name: string
                                                    image: string | null
                                                }
                                            }) => (
                                                <button
                                                    key={friendship.friend.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleFriend(
                                                            friendship.friend.id
                                                        )
                                                    }
                                                    className={cn(
                                                        "flex flex-col items-center p-2 rounded-lg border-2 transition-all min-w-[80px]",
                                                        selectedFriends.includes(
                                                            friendship.friend.id
                                                        )
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-1">
                                                        {friendship.friend
                                                            .image ? (
                                                            <img
                                                                src={
                                                                    friendship
                                                                        .friend
                                                                        .image
                                                                }
                                                                alt={
                                                                    friendship
                                                                        .friend
                                                                        .name
                                                                }
                                                                className="h-full w-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <Users className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium truncate max-w-[70px]">
                                                        {friendship.friend.name}
                                                    </span>
                                                    {selectedFriends.includes(
                                                        friendship.friend.id
                                                    ) && (
                                                        <Check className="h-3 w-3 text-primary mt-1" />
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4" />
                                When (Optional)
                            </label>
                            <div className="flex gap-2 mb-2">
                                <Button
                                    type="button"
                                    variant={
                                        timeMode === "single"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setTimeMode("single")}
                                    className="flex-1"
                                >
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Single Time
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        timeMode === "range"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setTimeMode("range")}
                                    className="flex-1"
                                >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Time Range
                                </Button>
                            </div>

                            <div className="bg-background rounded-lg border border-border p-3 space-y-3">
                                {timeMode === "single" ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => setStartTime(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSetNow}
                                        >
                                            Now
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">
                                                Start
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="datetime-local"
                                                    value={startTime}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>
                                                    ) =>
                                                        setStartTime(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSetNow}
                                                >
                                                    Now
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">
                                                End
                                            </label>
                                            <Input
                                                type="datetime-local"
                                                value={endTime}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => setEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            size="lg"
                            className="w-full mt-2"
                            disabled={!canSubmit}
                            onClick={() => createPingMutation.mutate()}
                        >
                            {createPingMutation.isPending ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Radio className="h-4 w-4 mr-2" />
                                    Send Ping ({selectedFriends.length} friend
                                    {selectedFriends.length !== 1 ? "s" : ""})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

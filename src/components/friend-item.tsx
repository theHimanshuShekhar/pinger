import { Users } from "lucide-react"

interface FriendItemProps {
    friend: {
        id: string
        name: string
        email: string
        image?: string | null
    }
    size?: "compact" | "normal"
}

export function FriendItem({ friend, size = "normal" }: FriendItemProps) {
    const isCompact = size === "compact"

    return (
        <div
            className={`flex flex-col items-center rounded-lg shadow-sm border border-border ${
                isCompact
                    ? "p-2 bg-muted min-w-[100px] sm:min-w-[120px]"
                    : "p-3 bg-background min-w-[120px]"
            }`}
        >
            <div
                className={`rounded-full bg-background flex items-center justify-center shrink-0 mb-1 sm:mb-2 ${
                    isCompact
                        ? "h-8 w-8 sm:h-10 sm:w-10 mb-1 sm:mb-2"
                        : "h-10 w-10 bg-primary/10 mb-2"
                }`}
            >
                {friend.image ? (
                    <img
                        src={friend.image}
                        alt={friend.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <Users
                        className={`text-primary ${
                            isCompact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5"
                        }`}
                    />
                )}
            </div>
            <div className="text-center min-w-0 w-full">
                <p
                    className={`font-medium truncate ${
                        isCompact ? "text-xs sm:text-sm" : "text-sm"
                    }`}
                >
                    {friend.name}
                </p>
                <p
                    className={`text-muted-foreground truncate ${
                        isCompact ? "text-[10px] sm:text-xs" : "text-xs"
                    }`}
                >
                    {friend.email}
                </p>
            </div>
        </div>
    )
}

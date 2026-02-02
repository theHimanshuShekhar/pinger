import { createFileRoute } from "@tanstack/react-router"
import { Activity, Radio, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: IndexPage })

function IndexPage() {
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
                <div className="flex-1 bg-muted rounded-lg overflow-auto">
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                            <UserPlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            No requests
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Friend requests will appear here
                        </p>
                    </div>
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
                    <div className="flex-1 bg-muted rounded-lg overflow-auto">
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                No friends yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Your friends will appear here once you connect
                            </p>
                        </div>
                    </div>
                </section>

                {/* Friend Requests - Half of 4.5/10ths */}
                <section className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-6 flex flex-col min-h-0">
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
                    <div className="flex-1 bg-muted rounded-lg overflow-auto">
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                                <UserPlus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                No requests
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Friend requests will appear here
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

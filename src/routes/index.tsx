import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: IndexPage })

function IndexPage() {
    return (
        <div className="h-full w-full flex flex-col gap-2 p-2">
            {/* Create Ping Button - Always 1/10th (flex-1), Mobile: order 2, Desktop: order 1 */}
            <section className="container mx-auto flex-1 order-2 md:order-1 min-h-0">
                <Button 
                    size="lg" 
                    className="w-full h-full text-lg font-semibold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all bg-primary"
                >
                    📡 Create Ping
                </Button>
            </section>

            {/* Current Pings - Always 4.5/10ths (flex-[9]), Mobile: order 1, Desktop: order 2 */}
            <section className="container mx-auto flex-[9] order-1 md:order-2 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 flex flex-col min-h-0">
                <h2 className="text-lg font-semibold mb-2 text-foreground">Current Pings</h2>
                <div className="flex-1 bg-muted rounded-lg p-4 shadow-inner overflow-auto">
                    <p className="text-muted-foreground">No active pings...</p>
                </div>
            </section>

            {/* Mobile: Friend Requests - 4.5/10ths (flex-[9]), full width, order 3 */}
            <section className="container mx-auto flex-[9] md:hidden bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 flex flex-col order-3 min-h-0">
                <h2 className="text-lg font-semibold mb-2 text-foreground">Friend Requests</h2>
                <div className="flex-1 bg-muted rounded-lg p-4 shadow-inner overflow-auto">
                    <p className="text-muted-foreground">No pending requests...</p>
                </div>
            </section>

            {/* Desktop: Friends + Friend Requests side by side - 4.5/10ths total (flex-[9]), order 3 */}
            <div className="container mx-auto hidden md:flex flex-[9] flex-row gap-2 md:order-3 min-h-0">
                {/* Current Friends - Half of 4.5/10ths */}
                <section className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 flex flex-col min-h-0">
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Current Friends</h2>
                    <div className="flex-1 bg-muted rounded-lg p-4 shadow-inner overflow-auto">
                        <p className="text-muted-foreground">Your friends will appear here...</p>
                    </div>
                </section>

                {/* Friend Requests - Half of 4.5/10ths */}
                <section className="flex-1 bg-background rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-border p-4 flex flex-col min-h-0">
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Friend Requests</h2>
                    <div className="flex-1 bg-muted rounded-lg p-4 shadow-inner overflow-auto">
                        <p className="text-muted-foreground">No pending requests...</p>
                    </div>
                </section>
            </div>
        </div>
    )
}

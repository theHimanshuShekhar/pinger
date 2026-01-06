import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/push/send-to-users")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    const body = await request.json() as {
                        recipientUserIds: string[]
                        title: string
                        message?: string
                        icon?: string
                    };

                    const { recipientUserIds, title, message, icon } = body;

                    if (!recipientUserIds || recipientUserIds.length === 0) {
                        return new Response(
                            JSON.stringify({ error: "Missing recipientUserIds" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        );
                    }

                    if (!title) {
                        return new Response(
                            JSON.stringify({ error: "Missing title" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        );
                    }

                    console.log("Sending push notification to users:", recipientUserIds);

                    // Import and call the server function
                    const { broadcastPushNotification } = await import("@/lib/server/push-service")
                    const result = await broadcastPushNotification({ data: { title, message, icon } });

                    return new Response(
                        JSON.stringify(result),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error sending push notification:", error);
                    const errorMessage = error instanceof Error ? error.message : 'Failed to send notification'
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: errorMessage
                        }),
                        { status: 500, headers: { "Content-Type": "application/json" } }
                    );
                }
            },
        },
    },
});

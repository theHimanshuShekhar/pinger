import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/db/db"
import { pushSubscriptions } from "@/db/push-schema"
import { eq } from "drizzle-orm"

export const Route = createFileRoute("/api/push/subscribe")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    const body = await request.json() as {
                        subscription: PushSubscriptionJSON;
                        userId: string;
                    };

                    const { subscription, userId } = body;

                    if (!subscription || !userId || !subscription.endpoint || !subscription.keys) {
                        return new Response(
                            JSON.stringify({ error: "Missing subscription or userId" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        );
                    }

                    // Store or update the subscription in the database
                    await db
                        .insert(pushSubscriptions)
                        .values({
                            id: crypto.randomUUID(),
                            userId: userId,
                            endpoint: subscription.endpoint,
                            auth: subscription.keys.auth ?? "",
                            p256dh: subscription.keys.p256dh ?? "",
                            userAgent: request.headers.get("user-agent") ?? "",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .onConflictDoUpdate({
                            target: pushSubscriptions.endpoint,
                            set: {
                                userId,
                                auth: subscription.keys.auth ?? "",
                                p256dh: subscription.keys.p256dh ?? "",
                                userAgent: request.headers.get("user-agent") ?? "",
                                updatedAt: new Date(),
                            },
                        });

                    return new Response(
                        JSON.stringify({ success: true, message: "Subscription saved" }),
                        { status: 201, headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error saving push subscription:", error);
                    return new Response(
                        JSON.stringify({ error: "Failed to save subscription" }),
                        { status: 500, headers: { "Content-Type": "application/json" } }
                    );
                }
            },

            DELETE: async ({ request }) => {
                try {
                    const body = await request.json() as {
                        endpoint: string;
                    };

                    const { endpoint } = body;

                    if (!endpoint) {
                        return new Response(
                            JSON.stringify({ error: "Missing endpoint" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        );
                    }

                    // Delete the subscription from the database
                    await db
                        .delete(pushSubscriptions)
                        .where(eq(pushSubscriptions.endpoint, endpoint));

                    return new Response(
                        JSON.stringify({ success: true, message: "Subscription deleted" }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error deleting push subscription:", error);
                    return new Response(
                        JSON.stringify({ error: "Failed to delete subscription" }),
                        { status: 500, headers: { "Content-Type": "application/json" } }
                    );
                }
            },
        },
    },
});

// import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig, type ViteDevServer } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import { VitePWA } from "vite-plugin-pwa"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { WebSocketServer } from "ws"

// In-memory storage for active users (dev mode)
const activeUsers = new Set<string>()

function websocketDevPlugin() {
    return {
        name: "websocket-dev-server",
        configureServer(_server: ViteDevServer) {
            try {
                // Create WebSocket server on a separate port to avoid Vite HMR conflicts
                const wss = new WebSocketServer({
                    port: 3001,
                    host: "localhost",
                    verifyClient: (info: { origin: string }) => {
                        console.log(
                            "[WebSocket] Verify client - Origin:",
                            info.origin
                        )
                        return true // Accept all for now during debugging
                    }
                })

                console.log("[WebSocket] Server running on ws://localhost:3001")

                wss.on("error", (err) => {
                    console.error("[WebSocket] Server error:", err)
                })

                wss.on("connection", (ws, req) => {
                    console.log(
                        "[WebSocket] Client connected from",
                        req.socket.remoteAddress
                    )
                    let userId: string | undefined

                    ws.on("error", (err) => {
                        console.error("[WebSocket] Client error:", err)
                    })

                    // Send current count on connection
                    try {
                        ws.send(
                            JSON.stringify({
                                type: "count",
                                count: activeUsers.size
                            })
                        )
                    } catch (err) {
                        console.error(
                            "[WebSocket] Failed to send initial count:",
                            err
                        )
                    }

                    ws.on("message", (data) => {
                        try {
                            const message = JSON.parse(data.toString()) as {
                                type: string
                                userId?: string
                            }

                            if (message.type === "auth" && message.userId) {
                                console.log(
                                    "[WebSocket] User authenticated:",
                                    message.userId
                                )
                                // Remove old user ID if present
                                if (userId) {
                                    activeUsers.delete(userId)
                                }

                                userId = message.userId
                                activeUsers.add(userId)

                                // Broadcast to all clients
                                wss.clients.forEach((client) => {
                                    if (client.readyState === 1) {
                                        try {
                                            client.send(
                                                JSON.stringify({
                                                    type: "count",
                                                    count: activeUsers.size
                                                })
                                            )
                                        } catch {
                                            // Client might be closing
                                        }
                                    }
                                })
                            }
                        } catch {
                            // Ignore invalid JSON
                        }
                    })

                    ws.on("close", () => {
                        console.log("[WebSocket] Client disconnected")
                        if (userId) {
                            activeUsers.delete(userId)

                            // Broadcast updated count
                            wss.clients.forEach((client) => {
                                if (client.readyState === 1) {
                                    try {
                                        client.send(
                                            JSON.stringify({
                                                type: "count",
                                                count: activeUsers.size
                                            })
                                        )
                                    } catch {
                                        // Client might be closing
                                    }
                                }
                            })
                        }
                    })
                })
            } catch (err) {
                console.error("[WebSocket] Failed to start server:", err)
            }
        }
    }
}

const config = defineConfig({
    plugins: [
        viteTsConfigPaths({
            projects: ["./tsconfig.json"]
        }),
        tailwindcss(),
        tanstackStart(),
        nitroV2Plugin({
            compatibilityDate: "2024-06-01",
            experimental: {
                websocket: false // Disabled - using custom WebSocket server on port 3001
            }
        }),
        viteReact(),
        devtoolsJson(),
        websocketDevPlugin(),
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            workbox: {
                // Don't precache HTML files - TanStack Start uses SSR
                globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
                // Handle navigation for SPA
                navigateFallback: null,
                // Add runtime caching for API routes and pages
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "document",
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "pages",
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // 1 day
                            }
                        }
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "script" ||
                            request.destination === "style",
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: "assets",
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                            }
                        }
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "image",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "images",
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: "Pinger",
                short_name: "Pinger",
                description: "Pinger - A TanStack Start app with Better Auth",
                theme_color: "#5865f2",
                background_color: "#36393f",
                display: "standalone",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "/logo192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "/logo512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            },
            devOptions: {
                enabled: false
            }
        })
    ]
})

export default config

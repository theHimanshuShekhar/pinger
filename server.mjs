#!/usr/bin/env node
import { createServer } from "node:http"
import { WebSocketServer } from "ws"

async function startServer() {
    // Import the Nitro app
    const { default: nitroApp } = await import("./chunks/nitro/nitro.mjs")

    // Create HTTP server
    const server = createServer((req, res) => {
        nitroApp.h3App.handler(req, res)
    })

    const port = process.env.NITRO_PORT || process.env.PORT || 3000
    const host = process.env.NITRO_HOST || "0.0.0.0"

    // Start HTTP server
    server.listen(port, host, () => {
        const address = server.address()
        console.log(
            `Listening on http://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`
        )
        console.log("WebSocket server ready")
    })

    // Create WebSocket server attached to HTTP server
    const wss = new WebSocketServer({
        server,
        verifyClient: () => true
    })

    // Track active users and ping rooms
    const activeUsers = new Set()
    const pingRooms = new Map()

    wss.on("connection", (ws) => {
        console.log("New WebSocket connection")

        ws.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString())

                switch (message.type) {
                    case "auth":
                        if (message.userId) {
                            ws.userId = message.userId
                            activeUsers.add(message.userId)
                            broadcastCount()
                        }
                        break

                    case "join":
                        if (message.pingId && message.userId) {
                            ws.pingId = message.pingId
                            if (!pingRooms.has(message.pingId)) {
                                pingRooms.set(message.pingId, new Set())
                            }
                            pingRooms.get(message.pingId).add(ws)

                            // Confirm join
                            ws.send(
                                JSON.stringify({
                                    type: "joined",
                                    pingId: message.pingId
                                })
                            )

                            // Notify others in room
                            broadcastToRoom(
                                message.pingId,
                                {
                                    type: "user_joined",
                                    pingId: message.pingId,
                                    userId: message.userId
                                },
                                ws
                            )
                        }
                        break

                    case "leave":
                        if (message.pingId && ws.pingId === message.pingId) {
                            const room = pingRooms.get(message.pingId)
                            if (room) {
                                room.delete(ws)
                                if (room.size === 0) {
                                    pingRooms.delete(message.pingId)
                                }
                            }
                            ws.pingId = undefined
                        }
                        break

                    case "chat":
                        if (
                            message.pingId &&
                            message.userId &&
                            message.content
                        ) {
                            const room = pingRooms.get(message.pingId)
                            if (room && room.has(ws)) {
                                broadcastToRoom(message.pingId, {
                                    type: "chat",
                                    pingId: message.pingId,
                                    userId: message.userId,
                                    content: message.content,
                                    timestamp: Date.now(),
                                    messageId: Math.random()
                                        .toString(36)
                                        .substring(2, 15)
                                })
                            }
                        }
                        break
                }
            } catch (err) {
                console.error("WebSocket message error:", err)
                ws.send(
                    JSON.stringify({
                        type: "error",
                        error: "Invalid message format"
                    })
                )
            }
        })

        ws.on("close", () => {
            if (ws.userId) {
                activeUsers.delete(ws.userId)
                broadcastCount()
            }
            if (ws.pingId) {
                const room = pingRooms.get(ws.pingId)
                if (room) {
                    room.delete(ws)
                    if (room.size === 0) {
                        pingRooms.delete(ws.pingId)
                    }
                }
            }
        })

        ws.on("error", (error) => {
            console.error("WebSocket error:", error)
        })

        // Send initial count
        ws.send(JSON.stringify({ type: "count", count: activeUsers.size }))
    })

    function broadcastToRoom(pingId, message, excludeWs) {
        const room = pingRooms.get(pingId)
        if (!room) return

        const data = JSON.stringify(message)
        room.forEach((client) => {
            if (client !== excludeWs && client.readyState === 1) {
                try {
                    client.send(data)
                } catch (err) {
                    // Client closing
                }
            }
        })
    }

    function broadcastCount() {
        const message = JSON.stringify({
            type: "count",
            count: activeUsers.size
        })
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                try {
                    client.send(message)
                } catch (err) {
                    // Client closing
                }
            }
        })
    }

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down...")
        wss.close(() => {
            server.close(() => {
                process.exit(0)
            })
        })
    })

    process.on("SIGINT", () => {
        console.log("SIGINT received, shutting down...")
        wss.close(() => {
            server.close(() => {
                process.exit(0)
            })
        })
    })
}

startServer().catch((err) => {
    console.error("Failed to start server:", err)
    process.exit(1)
})

import type { Server } from "node:http"
import { type RawData, type WebSocket, WebSocketServer } from "ws"

interface WebSocketMessage {
    type: string
    userId?: string
    pingId?: string
    content?: string
    timestamp?: number
}

interface CountMessage {
    type: "count"
    count: number
}

interface ChatMessage {
    type: "chat"
    pingId: string
    userId: string
    content: string
    timestamp: number
    messageId: string
}

interface JoinMessage {
    type: "join"
    pingId: string
    userId: string
}

interface LeaveMessage {
    type: "leave"
    pingId: string
    userId: string
}

interface ErrorMessage {
    type: "error"
    error: string
}

// Client metadata attached to WebSocket
interface ClientMeta {
    userId?: string
    pingId?: string
}

// Extend WebSocket type to include metadata
type WebSocketWithMeta = WebSocket & { meta?: ClientMeta }

export class PresenceWebSocketServer {
    private wss: WebSocketServer | null = null
    private activeUsers = new Set<string>()
    // Track ping rooms: pingId -> Set of WebSocket clients
    private pingRooms = new Map<string, Set<WebSocketWithMeta>>()

    attachToServer(server: Server): void {
        this.wss = new WebSocketServer({
            server,
            verifyClient: () => true
        })

        this.wss.on("connection", (ws: WebSocketWithMeta) => {
            ws.meta = {}

            this.sendCount(ws)

            ws.on("message", (data) => {
                this.handleMessage(ws, data)
            })

            ws.on("close", () => {
                this.handleDisconnect(ws)
            })
        })
    }

    startStandalone(port: number, host: string): void {
        this.wss = new WebSocketServer({
            port,
            host,
            verifyClient: () => true
        })

        this.wss.on("connection", (ws: WebSocketWithMeta) => {
            ws.meta = {}

            this.sendCount(ws)

            ws.on("message", (data) => {
                this.handleMessage(ws, data)
            })

            ws.on("close", () => {
                this.handleDisconnect(ws)
            })
        })
    }

    private handleMessage(ws: WebSocketWithMeta, data: RawData): void {
        try {
            const message = JSON.parse(data.toString()) as WebSocketMessage

            switch (message.type) {
                case "auth":
                    if (message.userId) {
                        this.handleAuth(ws, message.userId)
                    }
                    break

                case "join":
                    if (message.pingId && message.userId) {
                        this.handleJoin(ws, message.pingId, message.userId)
                    }
                    break

                case "leave":
                    if (message.pingId) {
                        this.handleLeave(ws, message.pingId)
                    }
                    break

                case "chat":
                    if (message.pingId && message.userId && message.content) {
                        this.handleChat(
                            ws,
                            message.pingId,
                            message.userId,
                            message.content
                        )
                    }
                    break

                default:
                    this.sendError(ws, "Unknown message type")
            }
        } catch {
            this.sendError(ws, "Invalid message format")
        }
    }

    private handleAuth(ws: WebSocketWithMeta, userId: string): void {
        const oldUserId = ws.meta?.userId

        if (oldUserId) {
            this.activeUsers.delete(oldUserId)
        }

        if (!ws.meta) ws.meta = {}
        ws.meta.userId = userId
        this.activeUsers.add(userId)

        this.broadcastCount()
    }

    private handleJoin(
        ws: WebSocketWithMeta,
        pingId: string,
        userId: string
    ): void {
        // Leave previous room if any
        if (ws.meta?.pingId) {
            this.handleLeave(ws, ws.meta.pingId)
        }

        if (!ws.meta) ws.meta = {}
        ws.meta.pingId = pingId

        // Add to new room
        if (!this.pingRooms.has(pingId)) {
            this.pingRooms.set(pingId, new Set())
        }
        this.pingRooms.get(pingId)!.add(ws)

        // Send room joined confirmation
        this.sendToClient(ws, {
            type: "joined",
            pingId
        })

        // Broadcast join to room members
        this.broadcastToRoom(
            pingId,
            {
                type: "user_joined",
                pingId,
                userId
            },
            ws
        ) // Exclude sender
    }

    private handleLeave(ws: WebSocketWithMeta, pingId: string): void {
        const room = this.pingRooms.get(pingId)
        if (room) {
            room.delete(ws)

            // Clean up empty rooms
            if (room.size === 0) {
                this.pingRooms.delete(pingId)
            }
        }

        if (ws.meta) {
            ws.meta.pingId = undefined
        }
    }

    private handleDisconnect(ws: WebSocketWithMeta): void {
        const userId = ws.meta?.userId
        const pingId = ws.meta?.pingId

        if (userId) {
            this.activeUsers.delete(userId)
            this.broadcastCount()
        }

        if (pingId) {
            this.handleLeave(ws, pingId)
        }
    }

    private handleChat(
        ws: WebSocketWithMeta,
        pingId: string,
        userId: string,
        content: string
    ): void {
        // Verify user is in the room
        const room = this.pingRooms.get(pingId)
        if (!room || !room.has(ws)) {
            this.sendError(ws, "Not in ping room")
            return
        }

        const chatMessage: ChatMessage = {
            type: "chat",
            pingId,
            userId,
            content,
            timestamp: Date.now(),
            messageId: Math.random().toString(36).substring(2, 15)
        }

        // Broadcast to all room members including sender
        this.broadcastToRoom(pingId, chatMessage)
    }

    private broadcastToRoom(
        pingId: string,
        message: object,
        excludeWs?: WebSocketWithMeta
    ): void {
        const room = this.pingRooms.get(pingId)
        if (!room) return

        const data = JSON.stringify(message)

        room.forEach((client) => {
            if (client !== excludeWs && client.readyState === 1) {
                try {
                    client.send(data)
                } catch {
                    // Client might be closing
                }
            }
        })
    }

    private sendToClient(ws: WebSocketWithMeta, message: object): void {
        if (ws.readyState === 1) {
            try {
                ws.send(JSON.stringify(message))
            } catch {
                // Client might be closing
            }
        }
    }

    private sendError(ws: WebSocketWithMeta, error: string): void {
        this.sendToClient(ws, { type: "error", error })
    }

    private sendCount(ws: WebSocketWithMeta): void {
        try {
            const message: CountMessage = {
                type: "count",
                count: this.activeUsers.size
            }
            ws.send(JSON.stringify(message))
        } catch {
            // Client might be closing
        }
    }

    private broadcastCount(): void {
        if (!this.wss) return

        const message: CountMessage = {
            type: "count",
            count: this.activeUsers.size
        }

        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                try {
                    client.send(JSON.stringify(message))
                } catch {
                    // Client might be closing
                }
            }
        })
    }

    stop(): void {
        if (this.wss) {
            this.wss.close()
            this.wss = null
        }
        this.pingRooms.clear()
        this.activeUsers.clear()
    }

    getActiveUsersCount(): number {
        return this.activeUsers.size
    }

    getPingRoomSize(pingId: string): number {
        return this.pingRooms.get(pingId)?.size ?? 0
    }
}

import type { Server } from "node:http"
import { type RawData, type WebSocket, WebSocketServer } from "ws"

interface WebSocketMessage {
    type: string
    userId?: string
}

interface CountMessage {
    type: "count"
    count: number
}

export class PresenceWebSocketServer {
    private wss: WebSocketServer | null = null
    private activeUsers = new Set<string>()

    attachToServer(server: Server): void {
        this.wss = new WebSocketServer({
            server,
            verifyClient: () => true
        })

        this.wss.on("connection", (ws) => {
            let userId: string | undefined

            this.sendCount(ws)

            ws.on("message", (data) => {
                this.handleMessage(ws, data, userId, (newUserId) => {
                    if (userId) {
                        this.activeUsers.delete(userId)
                    }
                    userId = newUserId
                    if (userId) {
                        this.activeUsers.add(userId)
                    }
                    this.broadcastCount()
                })
            })

            ws.on("close", () => {
                if (userId) {
                    this.activeUsers.delete(userId)
                    this.broadcastCount()
                }
            })
        })
    }

    startStandalone(port: number, host: string): void {
        this.wss = new WebSocketServer({
            port,
            host,
            verifyClient: () => true
        })

        this.wss.on("connection", (ws) => {
            let userId: string | undefined

            this.sendCount(ws)

            ws.on("message", (data) => {
                this.handleMessage(ws, data, userId, (newUserId) => {
                    if (userId) {
                        this.activeUsers.delete(userId)
                    }
                    userId = newUserId
                    if (userId) {
                        this.activeUsers.add(userId)
                    }
                    this.broadcastCount()
                })
            })

            ws.on("close", () => {
                if (userId) {
                    this.activeUsers.delete(userId)
                    this.broadcastCount()
                }
            })
        })
    }

    private sendCount(ws: WebSocket): void {
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

    private handleMessage(
        _ws: WebSocket,
        data: RawData,
        _currentUserId: string | undefined,
        onAuth: (userId: string) => void
    ): void {
        try {
            const message = JSON.parse(data.toString()) as WebSocketMessage

            if (message.type === "auth" && message.userId) {
                onAuth(message.userId)
            }
        } catch {
            // Ignore invalid JSON
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
    }

    getActiveUsersCount(): number {
        return this.activeUsers.size
    }
}

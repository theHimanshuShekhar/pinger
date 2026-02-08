import type { Message, Peer } from "crossws"
import { defineWebSocketHandler } from "h3"

// Store rooms and user tracking in memory
const rooms = new Map<string, Set<Peer>>()
const activeUsers = new Set<string>()

interface WebSocketPeer extends Peer {
    userId?: string
    pingId?: string
}

export default defineWebSocketHandler({
    open(peer: WebSocketPeer) {
        console.log("WebSocket connection opened")
        peer.send(
            JSON.stringify({
                type: "count",
                count: activeUsers.size
            })
        )
    },

    async message(peer: WebSocketPeer, message: Message) {
        try {
            const data = JSON.parse(message.text())

            switch (data.type) {
                case "auth":
                    if (data.userId) {
                        peer.userId = data.userId
                        activeUsers.add(data.userId)
                        broadcastCount()
                    }
                    break

                case "join":
                    if (data.pingId && data.userId) {
                        peer.pingId = data.pingId
                        if (!rooms.has(data.pingId)) {
                            rooms.set(data.pingId, new Set())
                        }
                        rooms.get(data.pingId)?.add(peer)

                        peer.send(
                            JSON.stringify({
                                type: "joined",
                                pingId: data.pingId
                            })
                        )

                        broadcastToRoom(
                            data.pingId,
                            {
                                type: "user_joined",
                                pingId: data.pingId,
                                userId: data.userId
                            },
                            peer
                        )
                    }
                    break

                case "leave":
                    if (data.pingId && peer.pingId === data.pingId) {
                        leaveRoom(peer)
                    }
                    break

                case "chat":
                    if (data.pingId && data.userId && data.content) {
                        const room = rooms.get(data.pingId)
                        if (room && room.has(peer)) {
                            broadcastToRoom(data.pingId, {
                                type: "chat",
                                pingId: data.pingId,
                                userId: data.userId,
                                content: data.content,
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
            peer.send(
                JSON.stringify({
                    type: "error",
                    error: "Invalid message format"
                })
            )
        }
    },

    close(peer: WebSocketPeer) {
        console.log("WebSocket connection closed")
        if (peer.userId) {
            activeUsers.delete(peer.userId)
            broadcastCount()
        }
        leaveRoom(peer)
    },

    error(peer: WebSocketPeer, error: Error) {
        console.error("WebSocket error:", peer, error)
    }
})

function leaveRoom(peer: WebSocketPeer) {
    if (peer.pingId) {
        const room = rooms.get(peer.pingId)
        if (room) {
            room.delete(peer)
            if (room.size === 0) {
                rooms.delete(peer.pingId)
            }
        }
        peer.pingId = undefined
    }
}

function broadcastToRoom(pingId: string, message: object, excludePeer?: Peer) {
    const room = rooms.get(pingId)
    if (!room) return

    const data = JSON.stringify(message)
    for (const peer of room) {
        if (peer !== excludePeer && peer.websocket?.readyState === 1) {
            try {
                peer.send(data)
            } catch {
                // Peer might be closing
            }
        }
    }
}

function broadcastCount() {
    const message = JSON.stringify({
        type: "count",
        count: activeUsers.size
    })

    rooms.forEach((room) => {
        for (const peer of room) {
            if (peer.websocket?.readyState === 1) {
                try {
                    peer.send(message)
                } catch {
                    // Peer might be closing
                }
            }
        }
    })
}

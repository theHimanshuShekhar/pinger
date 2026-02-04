import type { Server } from "node:http"
import { PresenceWebSocketServer } from "./websocket.js"

// Nitro plugin to attach WebSocket server to the same HTTP server
export default function websocketPlugin(nitroApp: {
    hooks: {
        hook: (event: string, handler: (arg: unknown) => void) => void
    }
}) {
    // Create WebSocket server instance
    const wsServer = new PresenceWebSocketServer()

    // Hook into Nitro's server creation to attach WebSocket
    nitroApp.hooks.hook("listen", (server) => {
        wsServer.attachToServer(server as Server)
    })

    // Handle shutdown
    nitroApp.hooks.hook("close", () => {
        wsServer.stop()
    })
}

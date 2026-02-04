/// <reference types="nitropack" />

declare global {
    function defineWebSocketHandler(
        handler: import("h3").WebSocketHandler
    ): import("h3").WebSocketHandler

    function defineNitroPlugin(
        handler: (nitroApp: import("nitropack").NitroApp) => void
    ): import("nitropack").NitroAppPlugin
}

export {}

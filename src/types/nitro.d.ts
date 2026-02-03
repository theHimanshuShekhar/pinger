/// <reference types="nitropack" />

declare global {
    function defineWebSocketHandler(
        handler: import("h3").WebSocketHandler
    ): import("h3").WebSocketHandler
}

export {}

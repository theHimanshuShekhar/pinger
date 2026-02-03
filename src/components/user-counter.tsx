"use client"

import { useDebouncer } from "@tanstack/react-pacer"
import { useEffect, useRef, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function UserCounter() {
    const { data: session } = authClient.useSession()
    const user = session?.user
    const [count, setCount] = useState<number>(0)
    const [connected, setConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    const isConnectingRef = useRef(false)

    // Keep track of reconnect timeout
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Debounced connect function to prevent rapid reconnections
    const debouncer = useDebouncer(
        (userId: string | undefined) => {
            // Prevent multiple simultaneous connection attempts
            if (isConnectingRef.current) {
                return
            }
            isConnectingRef.current = true

            // Clear any pending reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }

            // Close existing connection
            if (wsRef.current) {
                wsRef.current.close()
            }

            // Use separate WebSocket port to avoid Vite HMR conflicts
            const protocol =
                window.location.protocol === "https:" ? "wss:" : "ws:"
            const wsUrl = `${protocol}//localhost:3001`

            console.log("[UserCounter] Connecting to:", wsUrl)

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log("[UserCounter] WebSocket connected")
                setConnected(true)
                isConnectingRef.current = false

                // Authenticate if user is logged in
                if (userId && ws.readyState === WebSocket.OPEN) {
                    ws.send(
                        JSON.stringify({
                            type: "auth",
                            userId: userId
                        })
                    )
                }
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as {
                        type: string
                        count?: number
                    }

                    if (
                        data.type === "count" &&
                        typeof data.count === "number"
                    ) {
                        setCount(data.count)
                    }
                } catch {
                    // Ignore invalid messages
                }
            }

            ws.onclose = (event) => {
                console.log(
                    "[UserCounter] WebSocket closed:",
                    event.code,
                    event.reason
                )
                setConnected(false)
                wsRef.current = null
                isConnectingRef.current = false

                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null
                    debouncer.maybeExecute(userId)
                }, 3000)
            }

            ws.onerror = (error) => {
                console.error("[UserCounter] WebSocket error:", error)
                isConnectingRef.current = false
            }
        },
        { wait: 500, leading: false, trailing: true }
    )

    useEffect(() => {
        // Trigger debounced connection
        debouncer.maybeExecute(user?.id)

        return () => {
            debouncer.cancel()
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
            isConnectingRef.current = false
        }
    }, [user?.id, debouncer])

    // Don't show if not connected or no users
    if (!connected && count === 0) {
        return null
    }

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-2 ${
                connected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    connected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
            />
            {count} user{count !== 1 ? "s" : ""}
        </span>
    )
}

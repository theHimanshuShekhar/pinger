// import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { VitePWA } from "vite-plugin-pwa"

const config = defineConfig({
    plugins: [
        viteTsConfigPaths({
            projects: ["./tsconfig.json"]
        }),
        tailwindcss(),
        tanstackStart(),
        nitroV2Plugin({ compatibilityDate: "2024-06-01" }),
        viteReact(),
        devtoolsJson(),
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
                        urlPattern: ({ request }) => request.destination === "document",
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
                        urlPattern: ({ request }) => request.destination === "image",
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
                        src: "/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "/icon-512x512.png",
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

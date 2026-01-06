import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      injectManifest: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,wasm,css,html}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        swSrc: 'public/sw.ts',
        swDest: 'dist/sw.js',
      },
      devOptions: {
        enabled: true,
        navigateFallback: '/',
        suppressWarnings: true,
        type: 'module',
      },
    }),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

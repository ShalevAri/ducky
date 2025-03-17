import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ducky/',
  plugins: [
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 3145728, // 3MB
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      registerType: 'autoUpdate'
    })
  ],
  server: {
    port: 49152
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple optimization passes
        ecma: 2020 // Modern optimization
      },
      format: {
        comments: false // Remove comments
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          hashbang: ['./src/hashbang.ts'],
          bang: ['./src/bang.ts'],
          vendor: ['dedent']
        },
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    assetsInlineLimit: 4096, // inline assets < 4kb
    sourcemap: false, // Disable sourcemaps for production
    reportCompressedSize: false, // Slightly faster build
    chunkSizeWarningLimit: 1000 // KB
  },
  optimizeDeps: {
    include: ['dedent'],
    esbuildOptions: {
      target: 'esnext',
      treeShaking: true,
      minify: true
    }
  }
})

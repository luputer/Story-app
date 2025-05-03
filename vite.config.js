import {
  defineConfig
} from 'vite';
import {
  resolve
} from 'path';
import tailwindcss from '@tailwindcss/vite';
import {
  generateSW
} from 'workbox-build';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    tailwindcss(),
    {
      name: 'workbox-generate-sw',
      closeBundle: async () => {
        await generateSW({
          swDest: resolve(__dirname, 'dist/sw.js'),
          globDirectory: resolve(__dirname, 'dist'),
          globPatterns: ['**/*.{html,js,css,png,jpg,svg}'],
          runtimeCaching: [{
              urlPattern: ({
                request
              }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
                },
              },
            },
            {
              urlPattern: ({
                url
              }) => url.origin === self.location.origin,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
              },
            },
          ],
        });
      }
    }
  ]
});
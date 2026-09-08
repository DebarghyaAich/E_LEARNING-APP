import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1/course': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/unit': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/v1/content': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/interaction': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})

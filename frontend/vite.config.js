import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',    // supaya bisa diakses dari luar container
    port: 5173,         
    watch: {
      usePolling: true,  
    },
    allowedHosts: [
      'altertemplate.local',
      'localhost',
    ],
  },
})

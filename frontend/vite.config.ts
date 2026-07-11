import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api/* calls to backend in dev — avoids CORS in development
    // In prod, Traefik/Nginx does this routing
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});

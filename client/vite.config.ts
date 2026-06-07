import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// VITE_API_URL is set in Vercel's environment variables to point at the
// Render backend, e.g. https://studyflow-ai-api.onrender.com
// During local dev it is left unset so the built-in proxy is used instead.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@studyflow/shared": path.resolve(__dirname, "../shared/types.ts"),
    },
  },
  // Proxy only applies during `vite dev` (local development)
  server:
    command === "serve"
      ? {
          proxy: {
            "/generate-plan": {
              target: "http://localhost:3001",
              changeOrigin: true,
            },
          },
        }
      : {},
}));

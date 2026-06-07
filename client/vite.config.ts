import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      // Points to the local copy so Vercel's isolated build works
      "@studyflow/shared": path.resolve(__dirname, "src/types.ts"),
    },
  },
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

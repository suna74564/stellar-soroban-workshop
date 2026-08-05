import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/stellar-soroban-workshop/" : "/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["checkin"],
  },
  build: {
    chunkSizeWarningLimit: 4200,
  },
  server: {
    port: 4321,
  },
});

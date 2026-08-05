import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["checkin"],
  },
  build: {
    chunkSizeWarningLimit: 2200,
  },
  server: {
    port: 4321,
  },
});

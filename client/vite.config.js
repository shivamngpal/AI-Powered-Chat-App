import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // Or whatever port you prefer for the client
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "localhost",
    port: 5173,
    open: true,
    // Forward API requests to your backend server
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change 5000 to your backend server's port if different
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
  },
});

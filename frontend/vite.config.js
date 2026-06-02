import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@clerk")) return "vendor-clerk";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("@monaco-editor") || id.includes("monaco-editor")) return "vendor-monaco";
          if (id.includes("three") || id.includes("@react-three")) return "vendor-three";
          if (id.includes("react-dom") || id.includes("react-router") || /\/react\//.test(id)) {
            return "vendor-react";
          }
          if (id.includes("socket.io") || id.includes("axios") || id.includes("@tanstack")) {
            return "vendor-data";
          }
          return "vendor-misc";
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});

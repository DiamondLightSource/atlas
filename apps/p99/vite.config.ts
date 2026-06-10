// apps/p99/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import relay from "vite-plugin-relay";

export default defineConfig({
  plugins: [react(), relay],
  define: {
    global: {},
  },
});

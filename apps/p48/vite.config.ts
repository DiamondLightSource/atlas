import { defineConfig } from "vite";

const target = "https://p48-pollux-proto-jeg.diamond.ac.uk";
// A local Tiled for development; override with TILED_URL
const tiledTarget = process.env.TILED_URL ?? "http://localhost:8000";

export default defineConfig({
  server: {
    proxy: {
      // Mirrors the "tiled" upstream in helm/values.yaml
      "/api/data": {
        target: tiledTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/data/, "/api/v1"),
      },
      "/api/scripting": {
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/scripting/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) =>
            proxyReq.setHeader("origin", target),
          );
          proxy.on("proxyReqWs", (proxyReq) =>
            proxyReq.setHeader("origin", target),
          );
        },
      },
    },
  },
});

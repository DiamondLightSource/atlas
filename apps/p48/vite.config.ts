import { defineConfig } from "vite";

const target = "https://p48-pollux-proto-jeg.diamond.ac.uk";

export default defineConfig({
  server: {
    proxy: {
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

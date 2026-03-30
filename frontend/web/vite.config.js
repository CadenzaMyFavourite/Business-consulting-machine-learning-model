import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: apiBaseUrl
        ? undefined
        : {
            "/auth": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/users": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/tasks": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/predict": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/ws": {
              target: proxyTarget,
              changeOrigin: true,
              ws: true,
            },
          },
    },
  };
});

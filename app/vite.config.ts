import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    // Dev-only plugins: the Hono dev server and React inspector.
    // These must NOT be loaded during `vite build` — both have Node
    // dependencies that are absent in a lean Docker image and will cause
    // the build to crash with "Cannot find module" errors.
    ...(command === "serve"
      ? [
          (await import("@hono/vite-dev-server")).default({
            entry: "api/boot.ts",
            exclude: [/^\/(?!api\/).*$/],
          }),
          (await import("kimi-plugin-inspect-react")).inspectAttr(),
        ]
      : []),
    react(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
}));

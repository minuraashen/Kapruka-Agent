import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
// Async config so we can conditionally import dev-only plugins.
export default defineConfig(async ({ command }) => {
  const plugins = [react()];

  // @hono/vite-dev-server runs the Hono API inside the Vite dev server so
  // you get a single port in development. It must NOT be loaded during
  // `vite build` — it's a dev-only tool and shouldn't affect production.
  if (command === "serve") {
    const { default: devServer } = await import("@hono/vite-dev-server");
    plugins.unshift(
      devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] })
    );
  }

  return {
    plugins,
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
  };
});

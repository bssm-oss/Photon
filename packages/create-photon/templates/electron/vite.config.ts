import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: { outDir: "dist-renderer" },
  base: "./",
  server: { port: 3001 },
});
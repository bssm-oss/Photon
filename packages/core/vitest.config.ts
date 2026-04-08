import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["../../tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src"),
      "ion-engine": resolve(__dirname, "src"),
      "@ion-engine/compute/IonCompute": resolve(__dirname, "../compute/src/IonCompute"),
    },
  },
});

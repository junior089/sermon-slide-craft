import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

// Configuração separada do vite.config.ts para não carregar os plugins do
// TanStack Start e do nitro, que os testes de unidade não usam.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

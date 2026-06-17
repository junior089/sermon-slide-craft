import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type PluginOption } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// O TanStack Start precisa de um servidor para as server functions. Sem preset
// explícito o nitro não entra no build e só o bundle do cliente é gerado, o que
// quebra o deploy. Docker usa um servidor Node autônomo; a Vercel usa o
// formato Build Output API (.vercel/output).
function resolveNitroPreset(): string | undefined {
  if (process.env.BUILD_TARGET === "node") return "node-server";
  if (process.env.VERCEL) return "vercel";
  return undefined;
}

export default defineConfig(({ command }) => {
  const nitroPreset = command === "build" ? resolveNitroPreset() : undefined;

  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitroPreset ? nitro({ preset: nitroPreset }) : null,
    viteReact(),
  ];

  return {
    plugins,
    // O Vite usa PostCSS no dev e Lightning CSS no build. Usar Lightning CSS nos
    // dois evita diferenças de CSS entre o preview e o build final.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: "::", port: 8080 },
  };
});

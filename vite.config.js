import { cpSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "copy-static-runtime-assets",
      closeBundle() {
        const output = resolve(import.meta.dirname, "dist");
        mkdirSync(resolve(output, "cardapio"), { recursive: true });
        cpSync(resolve(import.meta.dirname, "cardapio"), resolve(output, "cardapio"), { recursive: true });
        for (const filename of ["runtime-config.js", "observability.js", "robots.txt"]) {
          copyFileSync(resolve(import.meta.dirname, filename), resolve(output, filename));
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        privacidade: resolve(import.meta.dirname, "privacidade.html"),
        termos: resolve(import.meta.dirname, "termos.html"),
      },
    },
  },
});

import { defineConfig } from "vitest/config";

/**
 * Limita Vitest a los tests de `src/`. Sin esto, si existe un build en `dist/`
 * (salida de `npm run build`), Vitest levanta los .js compilados (CommonJS) y
 * fallan al importar vitest. Los tests viven solo en src/**.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});

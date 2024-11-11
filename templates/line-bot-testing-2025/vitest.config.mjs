import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        coverage: {
            exclude: [...configDefaults.coverage.exclude, "api/**"],
        },
        setupFiles: ["tests/setup.ts"],
    },
});

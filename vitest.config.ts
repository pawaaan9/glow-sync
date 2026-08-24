import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(__dirname, "./src"),
  // The real `server-only` package throws unless it is resolved under the
  // "react-server" condition, which vitest does not set. The API tests need
  // the modules that import it, so it is stubbed out here.
  "server-only": path.resolve(__dirname, "./test/stubs/server-only.ts"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "ui",
          environment: "jsdom",
          setupFiles: ["./test/setup.ts"],
          include: ["test/{components,lib}/**/*.test.{ts,tsx}"],
          css: false,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "api",
          environment: "node",
          setupFiles: ["./test/setup.server.ts"],
          include: ["test/api/**/*.test.ts"],
          env: { NODE_ENV: "test" },
        },
      },
    ],
  },
});

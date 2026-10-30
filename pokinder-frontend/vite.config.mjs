import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  // The sources contain JSX in .js files.
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  server: { port: 3000 },
  build: {
    outDir: "build",
    // nginx serves and caches hashed files under /static/.
    assetsDir: "static",
  },
});

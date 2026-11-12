import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [
    react({ include: /\.(js|jsx)$/ }),
    // Precompress assets so nginx serves .br/.gz files without compressing on each request.
    compression({ algorithms: ["brotliCompress", "gzip"], threshold: 1024 }),
  ],
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

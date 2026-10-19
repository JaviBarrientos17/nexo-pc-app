import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Electron opens the bundled UI through file://, so assets must be relative
  // to index.html rather than rooted at the filesystem URL.
  base: "./",
  build: { outDir: "dist", emptyOutDir: true }
});

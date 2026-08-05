import { defineConfig } from "vitest/config";
import baseConfig from "@atlas/vitest-conf/vitest.config";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
  ...baseConfig,
});

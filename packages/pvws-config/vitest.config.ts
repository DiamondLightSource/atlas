import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@atlas/vitest-conf/vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    ...baseConfig,
    define: {
      "import.meta.env.VITE_PROFILER_ENABLED": JSON.stringify("false"),
    },
    test: {
      server: {
        deps: {
          inline: ["@diamondlightsource/cs-web-lib", "react-toastify"],
        },
      },
    },
  }),
);

import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import relay from "vite-plugin-relay";
import baseConfig from "@atlas/vitest-conf/vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [relay, react()],
    test: {
      coverage: {
        // userAuth is a temporary feature that will be removed in future
        exclude: ["**/context/userAuth/**"],
      },
    },
  }),
);

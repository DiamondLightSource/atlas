import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@atlas/vitest-conf/vitest.config";
import react from "@vitejs/plugin-react";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["**/RelayEnvironment.ts"],
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [
            // Enable graphql in tests
            [
              "babel-plugin-relay",
              { artifactDirectory: "./src/graphql/__generated__" },
            ],
          ],
        },
      }),
    ],
  }),
);

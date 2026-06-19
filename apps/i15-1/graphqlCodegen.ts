import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,

  schema: "./src/graphql/supergraph.graphql",
  documents: ["./src/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,

  generates: {
    "./src/graphql/__generated__/": {
      plugins: ["typescript-operations"],
      config: {
        generateOperationTypes: false,
      },
    },

    "./src/": {
      preset: "near-operation-file",
      plugins: ["typescript-operations"],
      config: {
        importSchemaTypesFrom: "./src/graphql/__generated__/",
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
      },
    },
  },
};

export default config;

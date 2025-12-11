import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./swagger.json",
    output: {
      biome: true,
      target: "src/http/generated",
      baseUrl: "http://localhost:3000",
      client: "react-query",
      clean: true,
      httpClient: "axios",
      mode: "tags-split",
      namingConvention: "kebab-case",
      override: {
        mutator: {
          path: "./src/lib/api.ts", // Path to your Axios instance
          name: "customInstance", // Ensure this matches the exported name
        },
      },
    },
  },
});

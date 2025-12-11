import { defineConfig } from "orval";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  api: {
    input: "./swagger.json",
    output: {
      biome: true,
      target: "src/http/generated",
      baseUrl: process.env.VITE_HTTP_API_URL,
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

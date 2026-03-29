import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";

export default defineWorkersConfig({
  resolve: {
    alias: {
      // Stub out MCP SDK in tests — ajv (CJS) is incompatible with vitest-pool-workers.
      "@modelcontextprotocol/sdk/server/mcp.js": path.resolve("test/stubs/mcp.ts"),
      "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js": path.resolve("test/stubs/mcp.ts"),
    },
  },
  test: {
    globals: true,
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          d1Databases: ["DB"],
          kvNamespaces: ["KV"],
          bindings: { ENVIRONMENT: "test" },
        },
        isolatedStorage: false,
      },
    },
  },
});

/**
 * Stub for @modelcontextprotocol/sdk modules in test environment.
 * The MCP SDK pulls in ajv (CJS) which is incompatible with vitest-pool-workers.
 */
export class McpServer {
  constructor(..._args: unknown[]) {}
  tool(..._args: unknown[]) {}
}

export class WebStandardStreamableHTTPServerTransport {
  constructor(..._args: unknown[]) {}
}

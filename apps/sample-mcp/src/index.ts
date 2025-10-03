import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import apiclient from "@jfontanez/api-client/rest/client.js";
import { serve } from "@hono/node-server";
import { AddressInfo } from "net";

const app = new Hono();

const BASE_URL = "https://0kadddxyh3.execute-api.us-east-1.amazonaws.com";

// Your MCP server implementation
const mcpServer = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

mcpServer.tool(
  "list_movies",
  "List all the movie genres available",
  {},
  async () => {
    const client = await apiclient.createClient(BASE_URL);
    const movies = await client?.GET_MOVIES({});

    const promptResponse = movies?.data.reduce((acc, movie) => {
      return (acc += `${movie.title} with a rating of ${movie.rating}\n`);
    }, "Cool new movies you can watch\n");

    return {
      content: [
        {
          type: "text",
          text: promptResponse ?? "I'm not sure what you should watch",
        },
      ],
    };
  }
);

app.all("/mcp", async (c) => {
  const transport = new StreamableHTTPTransport();
  await mcpServer.connect(transport);
  return transport.handleRequest(c);
});

export default app;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: "0.0.0.0",
  },
  (info: AddressInfo) => {
    console.log("Server started:", `${info.address ?? "0.0.0.0"}:${info.port}`);
  }
);

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

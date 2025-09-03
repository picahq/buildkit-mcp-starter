#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

class MCPServer {
    private app: express.Application;
    private transports: Record<string, {
        transport: StreamableHTTPServerTransport;
        server: Server;
    }> = {};

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupErrorHandling(): void {
        process.on("SIGINT", async () => {
            for (const { server } of Object.values(this.transports)) {
                await server.close();
            }
            process.exit(0);
        });
    }

    private createServer(): Server {
        const server = new Server(
            {
                name: "my-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        server.onerror = (error) => console.error("[MCP Server Error]", error);

        server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "echo",
                        description: "Echo back the provided message",
                        inputSchema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "The message to echo back",
                                }
                            },
                            required: ["message"],
                            additionalProperties: false,
                        },
                    },
                ],
            };
        });

        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            if (name === "echo") {
                return await this.handleEcho(args);
            }

            throw new Error(`Unknown tool: ${name}`);
        });

        return server;
    }

    private async handleEcho(args: any): Promise<any> {
        const message = args?.message;

        if (!message) {
            return {
                content: [{ type: "text", text: "Error: message is required" }],
                isError: true,
            };
        }

        return {
            content: [{ type: "text", text: `Echo: ${message}` }],
        };
    }

    private setupRoutes(): void {
        this.app.all('/mcp', async (req, res) => {
            try {
                const sessionId = req.headers['mcp-session-id'] as string ||
                    `session-${Date.now()}-${Math.random().toString(36)}`;

                if (!this.transports[sessionId]) {
                    console.log(`Creating new session: ${sessionId}`);

                    const transport = new StreamableHTTPServerTransport({
                        sessionIdGenerator: () => sessionId
                    });

                    const server = this.createServer();
                    await server.connect(transport);

                    this.transports[sessionId] = { transport, server };

                    setTimeout(() => {
                        if (this.transports[sessionId]) {
                            console.log(`Cleaning up session: ${sessionId}`);
                            this.transports[sessionId].server.close();
                            delete this.transports[sessionId];
                        }
                    }, 5 * 60 * 1000); // 5 minutes
                }

                const { transport } = this.transports[sessionId];
                await transport.handleRequest(req, res, req.body);

            } catch (error) {
                console.error('[MCP Request Error]', error);
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: { code: -32603, message: "Internal error" },
                    id: req.body?.id || null
                });
            }
        });
    }

    async start(): Promise<void> {
        const port = process.env.PORT || 3000;
        this.app.listen(port, () => {
            console.log(`MCP Server running on http://localhost:${port}/mcp`);
            console.log(`Use MCP Inspector to connect and test your server`);
        });
    }
}

const server = new MCPServer();
server.start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

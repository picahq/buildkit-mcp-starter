# Starter MCP Server

A starter [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) server implementation with TypeScript using HTTP transport. This starter includes one simple echo tool that demonstrates the core concepts of building MCP servers.

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start an HTTP server and listen for MCP requests. You should see:
```
MCP Server running on http://localhost:3333/mcp
Use MCP Inspector to connect and test your server
```

## Testing with MCP Inspector (Recommended)

The easiest way to test your MCP server is using the official [MCP Inspector](https://github.com/modelcontextprotocol/inspector), a visual testing tool designed specifically for MCP servers.

### Start the Inspector

```bash
npx @modelcontextprotocol/inspector
```

This will:
1. Start the MCP Inspector proxy server
2. Open your browser automatically 
3. Show you the Inspector interface

### Connect to Your Server

1. **Make sure your MCP server is running** first:
   ```bash
   npm start
   ```

2. **In the Inspector interface**:
   - Select **"Streamable HTTP"** as the transport type
   - Enter the server URL: `http://localhost:3333/mcp`
   - Click **"Connect"**

### Test Your Server

Once connected, you can:

- **List Tools**: Click "List Tools" to see available tools (should show your "echo" tool)
- **Call Tools**: 
  - Select the "echo" tool
  - Fill in the message parameter (e.g., "Hello MCP!")
  - Click "Call Tool" to test it
- **View Responses**: See real-time request/response data in a user-friendly interface

## Testing with cURL (Alternative)

Since this server uses HTTP transport, you can easily test it with curl commands:

#### Start the Server
First, make sure the server is running:
```bash
npm start
```

You should see: `MCP Server running on http://localhost:3333/mcp`

#### List Available Tools
```bash
curl -X POST http://localhost:3333/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

#### Call the echo Tool
```bash
curl -X POST http://localhost:3333/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"echo","arguments":{"message":"Hello World!"}}}'
```

### Expected Responses

**List Tools Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "echo",
        "description": "Echo back the provided message",
        "inputSchema": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "description": "The message to echo back"
            }
          },
          "required": ["message"],
          "additionalProperties": false
        }
      }
    ]
  }
}
```

**Tool Call Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Echo: Hello World!"
      }
    ]
  }
}
```

## Project Structure

```
my-mcp-server/
├── src/
│   └── server.ts 
├── build/
├── package.json
├── tsconfig.json
└── README.md
```

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) - Learn about the Model Context Protocol
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official TypeScript SDK for MCP
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) - Learn about OpenAI's API
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/) - Learn about BuildKit

#!/usr/bin/env node
/**
 * MCP (Model Context Protocol) Server
 * 
 * This is a simple JSON-RPC 2.0 server that exposes Aegis validation tools
 * over stdin/stdout for use with MCP-compatible AI assistants.
 * 
 * Usage:
 *   npm run mcp
 * 
 * The server accepts JSON-RPC 2.0 requests on stdin and returns responses on stdout.
 */

import * as readline from 'readline';
import { MCPRequest, MCPResponse } from '../types';
import { mcpTools, executeTool } from './tools';

/**
 * MCP Server class
 */
class MCPServer {
  private rl: readline.Interface;
  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }
  
  /**
   * Start the server
   */
  start(): void {
    console.error('Aegis MCP Server started (stderr for logs, stdout for JSON-RPC)');
    console.error('Available tools:', mcpTools.map(t => t.name).join(', '));
    
    this.rl.on('line', async (line: string) => {
      try {
        const request: MCPRequest = JSON.parse(line);
        const response = await this.handleRequest(request);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.error('Error processing request:', error);
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: null as any,
          error: {
            code: -32700,
            message: 'Parse error',
            data: (error as Error).message,
          },
        };
        console.log(JSON.stringify(errorResponse));
      }
    });
    
    this.rl.on('close', () => {
      console.error('MCP Server shutting down');
      process.exit(0);
    });
  }
  
  /**
   * Handle incoming JSON-RPC request
   */
  private async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    // Validate JSON-RPC structure
    if (request.jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'jsonrpc must be "2.0"',
        },
      };
    }
    
    // Handle methods
    switch (request.method) {
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: { tools: mcpTools },
        };
      
      case 'tools/call':
        return await this.handleToolCall(request);
      
      default:
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown method: ${request.method}`,
          },
        };
    }
  }
  
  /**
   * Handle tool call requests
   */
  private async handleToolCall(request: MCPRequest): Promise<MCPResponse> {
    try {
      const { name, arguments: args } = request.params;
      
      if (!name) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32602,
            message: 'Invalid params',
            data: 'Missing tool name',
          },
        };
      }
      
      console.error(`Executing tool: ${name}`);
      const result = await executeTool(name, args || {});
      
      return {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };
    } catch (error) {
      console.error('Tool execution error:', error);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: (error as Error).message,
        },
      };
    }
  }
}

// Start the server
const server = new MCPServer();
server.start();


import { MastraMCPClient } from '@mastra/mcp';
import { log } from 'apify';
import { MCP_SERVER_URL_BASE, MCP_TIMEOUT } from './const.js';

/**
 * Starts the MCP server with optional actor specification
 * @param {string} apifyToken - The Apify API token for authentication
 * @param {string[]} [actors] - Optional array of Actor names to be included in the server
 * @returns {Promise<void>}
 */
export async function startMCPServer (
    apifyToken: string,
    actors?: string[],
): Promise<void> {
    log.info('Starting MCP server...');
    const url = `${MCP_SERVER_URL_BASE}?token=${apifyToken}${actors ? `&actors=${actors.join(',')}` : ''}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MCP_TIMEOUT);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`MCP server start failed: ${response.status}`);
    } catch (error) {
        throw new Error(
            `MCP server start error: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Creates an MCP client instance
 * @param {string} apifyToken - The Apify API token for authentication
 * @returns {MastraMCPClient} MCP client instance
 */
export function createMCPClient (apifyToken: string): MastraMCPClient {
    return new MastraMCPClient({
        name: 'apify-client',
        server: {
            url: new URL(`${MCP_SERVER_URL_BASE}/sse?token=${apifyToken}`),
            requestInit: {
                headers: {
                    Authorization: `Bearer ${apifyToken}`,
                },
            },
        },
    });
}

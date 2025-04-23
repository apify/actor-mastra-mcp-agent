import { MastraMCPClient } from '@mastra/mcp';
import { ApifyClient, log } from 'apify';
import { getApifyToken } from './utils.js';

/**
 * Starts the MCP server with optional Actor specification
 * @param {string} mcpUrl - The MCP server URL
 * @param {string} apifyToken - The Apify API token for authentication
 * @param {string[]} [actors] - Optional array of Actor names to be included in the server
 * @returns {Promise<string>} The run ID of the MCP server
 */
export async function startMCPServer (
    mcpUrl: string,
    apifyToken: string,
    actors: string[],
): Promise<string> {
    const url = `${mcpUrl}?actors=${actors.join(',')}`;
    log.info(`Starting MCP server with url: ${url}`);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apifyToken}`,
        },
    });
    const json = (await response.json()) as { data: { id: string } };
    return json.data.id;
}
/**
 * Stops the running MCP server
 * @returns {Promise<void>}
 */
export async function stopMCPServer (runId: string): Promise<void> {
    log.info('Stopping MCP server...');

    const token = getApifyToken();
    const apifyClient = new ApifyClient({ token });

    const run = apifyClient.run(runId);
    if ((await run.get())?.status === 'RUNNING') await run.abort();
}

/**
 * Creates an MCP client instance
 * @param {string} mcpUrl - The MCP server URL
 * @param {string} apifyToken - The Apify API token for authentication
 * @param {number} [timeout=300_000] - The timeout in milliseconds for the client
 * @returns {MastraMCPClient} MCP client instance
 */
export function createMCPClient (
    mcpUrl: string,
    apifyToken: string,
    timeout: number = 300_000,
): MastraMCPClient {
    return new MastraMCPClient({
        name: 'apify-client',
        server: {
            url: new URL(`${mcpUrl}/sse`),
            requestInit: {
                headers: {
                    Authorization: `Bearer ${apifyToken}`,
                },
            },
            eventSourceInit: {
                // The EventSource package augments EventSourceInit with a "fetch" parameter.
                // You can use this to set additional headers on the outgoing request.
                // Based on this example: https://github.com/modelcontextprotocol/typescript-sdk/issues/118
                async fetch (input: Request | URL | string, init?: RequestInit) {
                    const headers = new Headers(init?.headers || {});
                    headers.set(
                        'authorization',
                        `Bearer ${process.env.APIFY_TOKEN}`,
                    );
                    return fetch(input, { ...init, headers });
                },
            },
        },
        timeout,
    });
}

import { MastraMCPClient } from '@mastra/mcp';
import { ApifyClient, log } from 'apify';
import { MCP_ACTOR_ID, MCP_SERVER_URL_BASE } from './const.js';
import { getApifyToken } from './utils.js';

/**
 * Starts the MCP server with optional Actor specification
 * @param {string} apifyToken - The Apify API token for authentication
 * @param {string[]} [actors] - Optional array of Actor names to be included in the server
 * @returns {Promise<string>} The run ID of the MCP server
 */
export async function startMCPServer (
    apifyToken: string,
    actors: string[],
): Promise<string> {
    log.info('Starting MCP server...');
    const url = `${MCP_SERVER_URL_BASE}?actors=${actors.join(',')}`;
    let response: Response;
    try {
        response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apifyToken}`,
            },
        });
    } catch (error) {
        throw new Error(
            `MCP server start error: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
    }
    if (!response.ok) throw new Error(`MCP server start failed: ${response.status}`);

    return await getMCPServerRunId();
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
 * @param {string} apifyToken - The Apify API token for authentication
 * @returns {MastraMCPClient} MCP client instance
 */
export function createMCPClient (apifyToken: string): MastraMCPClient {
    return new MastraMCPClient({
        name: 'apify-client',
        server: {
            url: new URL(`${MCP_SERVER_URL_BASE}/sse`),
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
        timeoutMillis: 300_000,
    });
}

export async function getMCPServerRunId (): Promise<string> {
    const token = getApifyToken();
    const apifyClient = new ApifyClient({ token });

    const run = await apifyClient.actor(MCP_ACTOR_ID).lastRun().get();

    const runId = run?.id;
    if (!runId) throw new Error('MCP server run ID not found');
    return runId;
}

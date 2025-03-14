import { ApifyClient } from 'apify';
import { MCP_ACTOR_ID } from './const.js';

export function getApifyToken (): string {
    if (!process.env.APIFY_TOKEN) {
        throw new Error('APIFY_TOKEN environment variable must be set');
    }
    return process.env.APIFY_TOKEN;
}

export async function isMCPserverRunning (): Promise<boolean> {
    const token = getApifyToken();
    const apifyClient = new ApifyClient({ token });

    const lastRun = await apifyClient.actor(MCP_ACTOR_ID).lastRun().get();
    return lastRun?.status === 'RUNNING';
}

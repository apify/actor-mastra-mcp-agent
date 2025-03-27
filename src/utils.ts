export function getApifyToken (): string {
    if (!process.env.APIFY_TOKEN) {
        throw new Error('APIFY_TOKEN environment variable must be set');
    }
    return process.env.APIFY_TOKEN;
}

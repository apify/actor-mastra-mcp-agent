// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor, log, LogLevel } from 'apify';
import { createAgent } from './agents.js';
import { createMCPClient, startMCPServer } from './mcp.js';
import { getApifyToken, isMCPserverRunning } from './utils.js';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// Actor input schema
interface Input {
    query: string;
    modelName: string;
    debug: boolean;
    actorsIncluded: string[];
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

/**
 * Actor code
 */

// Charge for Actor start
await Actor.charge({ eventName: 'actor-start' });

// Handle input
const {
    // The query default value is provided only for template testing purposes.
    // You can remove it.
    query,
    modelName,
    debug = false,
    actorsIncluded = [],
} = (await Actor.getInput()) as Input;
if (!query) throw new Error('An agent query is required.');
if (debug) log.setLevel(LogLevel.DEBUG);

// Create MCP server
const apifyToken = getApifyToken();
log.debug(`MCP running: ${await isMCPserverRunning()}`);
if (!(await isMCPserverRunning())) await startMCPServer(apifyToken, actorsIncluded);
const mcpClient = createMCPClient(apifyToken);
try {
    // Connect to MCP server
    log.info('Connecting to MCP server...');
    await mcpClient.connect();
    // Gracefully handle process exits
    process.on('exit', async () => {
        await mcpClient.disconnect();
    });
    // Fetch tools
    const tools = await mcpClient.tools();
    log.debug(`Tools: ${JSON.stringify(tools)}`);

    // Create the agent
    const agent = createAgent(modelName);

    log.info(`Querying the agent with the following query:\n${query}`);

    // Query the agent and get the response
    const response = await agent.generate(query, {
        toolsets: {
            apify: tools,
        },
    });

    log.info(`Agent response: ${response.text}`);
    log.info(`Tokens used total: ${response.usage.totalTokens}`);
    log.info(`Prompt tokens used: ${response.usage.promptTokens}`);
    log.info(`Completion tokens used: ${response.usage.completionTokens}`);

    // Charge for the task completion
    log.info('Charging for task completion...');
    await Actor.charge({ eventName: 'task-completed' });

    // Push results into the dataset
    log.info('Pushing results into the dataset...');
    await Actor.pushData({
        query,
        response: response.text,
    });
} catch (error) {
    log.error(`Actor failed with error: ${error}`);
    await Actor.fail({
        statusMessage: 'Actor faied with an error, see logs',
    });
} finally {
    // Always disconnect when done
    await mcpClient.disconnect();
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();

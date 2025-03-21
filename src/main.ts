// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor, log, LogLevel } from 'apify';
import { createAgent } from './agents.js';
import { createMCPClient, startMCPServer, stopMCPServer } from './mcp.js';
import { getApifyToken } from './utils.js';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// Actor input schema
interface Input {
    prompt: string;
    agentName: string;
    agentInstructions: string;
    modelName: string;
    debug: boolean;
    actors: string[];
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
    prompt,
    agentName,
    agentInstructions,
    modelName,
    debug = false,
    actors,
} = (await Actor.getInput()) as Input;
if (!prompt) throw new Error('An agent prompt is required.');
if (!actors || actors.length === 0) throw new Error('At least one Apify Actor name is required.');
if (debug) log.setLevel(LogLevel.DEBUG);

// Create MCP server
const apifyToken = getApifyToken();
const mcpClient = createMCPClient(apifyToken);
let mcpRunId = '';
try {
    mcpRunId = await startMCPServer(apifyToken, actors);
    // Connect to MCP server
    log.info('Connecting to MCP server...');
    await mcpClient.connect();

    // Gracefully handle process exits
    process.on('exit', async () => {
        await mcpClient.disconnect();
        await stopMCPServer(mcpRunId);
    });
    // Fetch tools
    const tools = await mcpClient.tools();
    log.debug(`Tools: ${JSON.stringify(tools)}`);

    // Create the agent
    const agent = createAgent({
        modelName,
        agentName,
        agentInstructions,
    });

    log.info(`Prompting the agent with the following query: ${prompt}`);

    // Query the agent and get the response
    const response = await agent.generate(prompt, {
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
        prompt,
        response: response.text,
    });
} catch (error) {
    log.error(
        `Actor failed with error: ${error instanceof Error ? error.stack : error}`,
    );
    await Actor.fail({
        statusMessage: 'Actor failed with an error, see logs',
        exit: false,
    });
} finally {
    // Always disconnect when done
    await mcpClient.disconnect();
    if (mcpRunId) await stopMCPServer(mcpRunId);
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
// do not call process.exit() to wait for async operations to complete
await Actor.exit({ exit: false });

// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Actor, log, LogLevel } from 'apify';
import { gracefulExit } from 'exit-hook';
import { createMCPClient, startMCPServer, stopMCPServer } from './mcp.js';
import { getApifyToken } from './utils.js';

// this is an ESM project, and as such, it requires you to specify extensions in your relative imports
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
    toolTimeout: number;
    maxSteps: number;
    mcpUrl: string;
}

async function main (): Promise<number> {
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
        mcpUrl,
        actors,
        toolTimeout,
        maxSteps,
    } = (await Actor.getInput()) as Input;
    if (!prompt) throw new Error('An agent prompt is required.');
    if (!actors || actors.length === 0) throw new Error('At least one Apify Actor name is required.');
    if (debug) log.setLevel(LogLevel.DEBUG);

    // Create an MCP server
    const apifyToken = getApifyToken();
    const timeoutMillis = toolTimeout * 1000;
    const mcpClient = createMCPClient(mcpUrl, apifyToken, timeoutMillis);

    let mcpRunId = '';
    try {
        mcpRunId = await startMCPServer(mcpUrl, apifyToken, actors);
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
        log.debug(
            `Creating agent: ${agentName} (${modelName}) with instructions: ${agentInstructions}`,
        );
        const agent = new Agent({
            name: agentName,
            instructions: agentInstructions,
            model: openai(modelName),
            tools,
        });

        // Enrich the query
        const enrichedPrompt = `${prompt}\n\nCurrent date and time: ${new Date().toISOString()}`;
        log.info(`Prompting the agent with the following query: ${enrichedPrompt}`);

        // Query the agent and get the response
        const response = await agent.generate(
            [
                {
                    role: 'user',
                    content: enrichedPrompt,
                },
            ],
            {
                maxSteps,
                onStepFinish: (step: string) => {
                    log.info('Step completed:', { message: step.slice(0, 100) });
                },
            },
        );

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
            prompt: enrichedPrompt,
            response: response.text,
        });
    } catch (error) {
        log.error(
            `Actor failed with error: ${error instanceof Error ? error.stack : error}`,
        );

        // Always disconnect when done
        await mcpClient.disconnect();
        if (mcpRunId) await stopMCPServer(mcpRunId);
        await Actor.fail({
            statusMessage: 'Actor failed with an error, see logs',
            exit: false,
        });
        return 1;
    }

    // Always disconnect when done
    await mcpClient.disconnect();
    if (mcpRunId) await stopMCPServer(mcpRunId);

    // Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
    // do not call process.exit() to wait for async operations to complete
    await Actor.exit({ exit: false });
    return 0;
}

const exitCode = await main();
gracefulExit(exitCode);

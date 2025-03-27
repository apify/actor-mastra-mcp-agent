import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { log } from 'apify';

export function createAgent ({
    modelName,
    agentName,
    agentInstructions,
}: {
    modelName: string;
    agentName: string;
    agentInstructions: string;
}): Agent {
    log.debug(
        `Creating agent: ${agentName} (${modelName}) with instructions: ${agentInstructions}`,
    );
    return new Agent({
        name: agentName,
        instructions: agentInstructions,
        model: openai(modelName),
    });
}

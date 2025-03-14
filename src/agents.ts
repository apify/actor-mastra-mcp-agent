import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const createAgent = (modelName: string): Agent => new Agent({
    name: 'Helpful Assistant Agent',
    instructions: `You are a helpful assistant who aims to help users with their questions and tasks.
    You provide clear, accurate information and guidance while maintaining a friendly and professional attitude.`,
    model: openai(modelName),
});

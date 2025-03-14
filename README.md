# Mastra AI Agent with Apify MCP Server

[![Mastra AI Agent](https://apify.com/actor-badge?actor=jakub.kopecky/actor-mastra-mcp-agent)](https://apify.com/jakub.kopecky/actor-mastra-mcp-agent)
[![GitHub Repo stars](https://img.shields.io/github/stars/apify/actor-mastra-mcp-agent)](https://github.com/apify/actor-mastra-mcp-agent/stargazers)

The **Mastra AI Agent with Apify MCP Server** is a generic AI agent designed to demonstrate the power of the [mastra.ai](https://mastra.ai/) framework when paired with the [Apify MCP Server](https://apify.com/apify/actors-mcp-server). This Actor leverages the Model Context Protocol (MCP) to connect AI-driven workflows with Apify’s extensive library of Actors, enabling seamless data extraction, web scraping, and task automation.

Built with TypeScript and the Apify SDK, this Actor serves as a flexible starting point for developers looking to create custom AI agents that tap into real-time web data and tools.

## 🎯 Features

- 🤖 **AI-powered assistance**: Uses the [mastra.ai](https://mastra.ai/) framework to process queries with OpenAI models (e.g., `gpt-4o`, `gpt-4o-mini`).
- 🌐 **Apify MCP integration**: Connects to the Apify MCP Server to access tools like `clockworks/free-tiktok-scraper` and more.
- 💰 **Pay-per-event pricing**: Flexible, usage-based billing for Actor runs and task completions.

## 🔄 How it works

1. 📥 **Input**
   - Query (e.g., "Analyze posts from @openai and summarize AI trends")
   - Model selection (`gpt-4o` or `gpt-4o-mini`)
   - Optional debug mode

2. 🤖 **Processing with Mastra**
   - Initializes a `Helpful Assistant Agent` using the mastra.ai framework.
   - Connects to the Apify MCP Server via Server-Sent Events (SSE).
   - Fetches available tools (e.g., TikTok scrapers, web browsers) dynamically.
   - Executes the query, leveraging MCP tools as needed.

3. 📤 **Output**
   - Returns the agent’s response as text.
   - Stores results in an Apify dataset with the query and response.

### 💰 Pricing

This Actor uses the [Pay Per Event](https://docs.apify.com/platform/actors/publishing/monetize#pay-per-event-pricing-model) (PPE) model for cost-effective, usage-based pricing.

| Event                  | Price (USD) |
|------------------------|-------------|
| Actor start            | $0.10       |
| Task completion        | $0.40       |

### Input Example

```json
{
  "query": "Analyze the posts of @openai and summarize current trends in AI.",
  "modelName": "gpt-4o-mini",
  "debug": true
}
```

### Output Example

Dataset entry:
```json
{
  "query": "Analyze the posts of @openai and summarize current trends in AI.",
  "response": "Here’s a summary of the recent posts from OpenAI's Instagram account, highlighting current trends in AI..."
}
```

## 🔧 Technical highlights

- **Mastra.ai framework**: Powers the AI agent.
- **Apify MCP Server**: Exposes Apify Actors as tools via the Model Context Protocol.
- **Apify SDK**: Ensures seamless integration with the Apify platform.
- **TypeScript**: Provides type safety and modern JavaScript features.

## 🤖 Under the hood with [mastra.ai](https://mastra.ai/)

This Actor uses the mastra.ai framework to create a generic AI agent that interacts with the Apify ecosystem:

### 👤 The agent

- **Helpful Assistant Agent**:
  ```typescript
  new Agent({
    name: 'Helpful Assistant Agent',
    instructions: 'You are a helpful assistant who aims to help users with their questions and tasks.',
    model: openai(modelName),
  });
  ```
  - Goal: Answer queries accurately and leverage MCP tools when needed.
  - Tools: Dynamically fetched from the Apify MCP Server (e.g., `clockworks/free-tiktok-scraper`).

### 🔄 Workflow

1. **Initialization**:
   - Starts the MCP Server if it’s not already running.
   - Connects via SSE using the `MastraMCPClient`.

2. **Execution**:
   - Queries the agent with user input.
   - Integrates MCP tools into the agent’s toolset.
   - Processes the response using the selected OpenAI model.

3. **Output**:
   - Logs token usage and the agent's response.
   - Saves results to the dataset.

### 🛠️ Tools

Expandable to any Apify Actor from the [Apify Store](https://apify.com/store) via the MCP Server configuration.

## ⚙️ Usage

### Running on Apify

1. Clone the repository.
2. Push the Actor to the Apify platform:
   ```bash
   apify push
   ```
3. Set Actor `OPENAI_API_KEY` [environment variable](https://docs.apify.com/platform/actors/development/programming-interface/environment-variables#custom-environment-variables).
4. Run the Actor with your input via the Apify Console or API.

### Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   OPENAI_API_KEY=<your-openai-api-key> apify run -i '{"query": "Show me latest post from @openai TikTok profile", "actorsIncluded": ["clockworks/free-tiktok-scraper"]}'
   ```

## 📖 Learn more

- [Mastra.ai Framework](https://mastra.ai/)
- [Apify MCP Server](https://apify.com/apify/actors-mcp-server)
- [Apify Platform](https://apify.com)
- [Apify SDK Documentation](https://docs.apify.com/sdk/js)
- [What is MCP?](https://blog.apify.com/what-is-model-context-protocol/)
- [What are AI agents?](https://blog.apify.com/what-are-ai-agents/)
- [How to build an AI agent on Apify](https://blog.apify.com/how-to-build-an-ai-agent/)

## 🚀 Get started

Ready to build your own AI agent? Deploy this Actor on Apify, tweak the query, and explore the possibilities of mastra.ai and MCP! 🤖✨

## 🌐 Open source

This Actor is open-source, hosted on [GitHub](https://github.com/apify/actor-mastra-mcp-agent). Want to add features? Open an issue or submit a pull request!

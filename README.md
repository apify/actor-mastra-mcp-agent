# Mastra AI Agent with Apify MCP Server

[![Mastra AI Agent](https://apify.com/actor-badge?actor=jakub.kopecky/actor-mastra-mcp-agent)](https://apify.com/jakub.kopecky/actor-mastra-mcp-agent)
[![GitHub Repo stars](https://img.shields.io/github/stars/apify/actor-mastra-mcp-agent)](https://github.com/apify/actor-mastra-mcp-agent/stargazers)

The **Mastra AI Agent with Apify MCP Server** is a generic AI agent designed to demonstrate the power of the [mastra.ai](https://mastra.ai/) framework when paired with the [Apify MCP Server](https://apify.com/apify/actors-mcp-server). This Actor leverages the Model Context Protocol (MCP) to connect AI-driven workflows with Apify’s extensive library of Actors, enabling seamless data extraction, web scraping, and task automation.

Built with TypeScript and the Apify SDK, this Actor serves as a flexible starting point for developers looking to create custom AI agents that tap into real-time web data and tools.

## 🛠️ Use cases

### TikTok trend analysis

Scrape TikTok posts from a specific account and summarize key trends.

**Example input**:
```json
{
  "prompt": "Scrape the latest 10 posts from @techcrunch on TikTok and summarize key tech topics.",
  "agentName": "TikTok Tech Analyzer",
  "agentInstructions": "You are a tech analyst scraping TikTok posts to identify trends.",
  "modelName": "gpt-4o-mini",
  "actors": ["clockworks/free-tiktok-scraper"]
}
```

**Example output**:
```json
{
  "prompt": "Scrape the latest 10 posts from @techcrunch on TikTok and summarize key tech topics.",
  "response": "Here are the latest 10 posts from TechCrunch on TikTok, along with key tech topics summarized..."
}
```

### Web research synthesis

Search the web for a topic and distill top findings.

**Example input**:
```json
{
  "prompt": "Search the web for recent advances in quantum computing and explain the top 3 breakthroughs.",
  "agentName": "Quantum Research Bot",
  "agentInstructions": "You are a research assistant that scours the web for technical info.",
  "modelName": "gpt-4o",
  "actors": ["apify/rag-web-browser"]
}
```

**Example output**:
```json
{
  "prompt": "Search the web for recent advances in quantum computing and explain the top 3 breakthroughs.",
  "response": "Here are the top three recent advances in quantum computing as of 2025..."
}
```

### Your use case 💡

Tweak the input and create your own AI agent to tackle your use case! 🚀

## 🎯 Features

- 🤖 **AI-powered assistance**: Uses the [mastra.ai](https://mastra.ai/) framework to process prompts with OpenAI models (e.g., `gpt-4o`, `gpt-4o-mini`).
- 🌐 **Apify MCP integration**: Connects to the Apify MCP Server to access tools like `clockworks/free-tiktok-scraper` and more.
- 💰 **Pay-per-event pricing**: Flexible, usage-based billing for Actor runs and task completions.

## 🔄 How it works

1. 📥 **Input**
   - Prompt (e.g., "Analyze posts from @openai and summarize AI trends")
   - Agent name (e.g., "Helpful Assistant Agent") - name for the agent
   - Agent instructions (e.g., "You are a helpful assistant...") - description of the agent's role, who the agent is and what it does
   - Model selection (`gpt-4o` or `gpt-4o-mini`)
   - Actors (e.g., `["clockworks/free-tiktok-scraper"]`) - list of Apify Actors to be served by the MCP server for the agent

2. 🤖 **Processing with Mastra**
   - Initializes the agent using the mastra.ai framework.
   - Connects to the Apify MCP Server via Server-Sent Events (SSE).
   - Fetches available tools (e.g., TikTok scrapers, web browsers) dynamically.
   - Executes the prompt, leveraging MCP tools as needed.

3. 📤 **Output**
   - Returns the agent’s response as text.
   - Stores results in an Apify dataset with the prompt and response.

### 💰 Pricing

This Actor uses the [Pay Per Event](https://docs.apify.com/platform/actors/publishing/monetize#pay-per-event-pricing-model) (PPE) model for cost-effective, usage-based pricing.

| Event                  | Price (USD) |
|------------------------|-------------|
| Actor start            | $0.10       |
| Task completion        | $0.40       |

### Input example

```json
{
  "prompt": "Analyze the posts of @openai and summarize current trends in AI.",
  "agentName": "Social Media Analyst",
  "agentInstructions": "You are a social media analyst who specializes in analyzing posts from various social media platforms.",
  "modelName": "gpt-4o-mini",
  "actors": ["clockworks/free-tiktok-scraper"]
}
```

### Output example

Dataset entry:
```json
{
  "prompt": "Analyze the posts of @openai and summarize current trends in AI.",
  "response": "Here’s a summary of the recent posts from OpenAI's account, highlighting current trends in AI..."
}
```

## 🔧 Technical highlights

- **Mastra.ai framework**: Powers the AI agent.
- **Apify MCP Server**: Exposes Apify Actors as tools via the Model Context Protocol.
- **Apify SDK**: Ensures seamless integration with the Apify platform.
- **TypeScript**: Provides type safety and modern JavaScript features.

## 🤖 Under the hood with [mastra.ai](https://mastra.ai/)

This Actor uses the mastra.ai framework to create a generic AI agent that interacts with the Apify ecosystem:

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
   OPENAI_API_KEY=<your-openai-api-key> apify run -i '{"prompt": "Show me latest post from @openai TikTok profile", "actors": ["clockworks/free-tiktok-scraper"]}'
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

Ready to build your own AI agent? Deploy this Actor on Apify, tweak the input, and explore the possibilities of mastra.ai and MCP! 🤖✨

## 🌐 Open source

This Actor is open-source, hosted on [GitHub](https://github.com/apify/actor-mastra-mcp-agent). Want to add features? Open an issue or submit a pull request!

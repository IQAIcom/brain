# 🌐 Plugin Wiki

A plugin for interacting with IQ.Wiki to retrieve and explore wiki content from the decentralized knowledge platform.

## 📌 Overview

The Plugin Wiki provides an interface to interact with IQ.Wiki's content. It enables users to:

- ✅ Retrieve specific wiki articles by ID 📄
- ✅ View user-created wikis 👤
- ✅ View user-edited wikis 📝
- ✅ View user wiki activities (both creations and edits) 📊
- ✅ Filter wikis by time period ⏱️

All data is fetched directly from the IQ.Wiki GraphQL API.

## 🛠 Installation

Install the plugin using pnpm:

```bash
pnpm add @iqai/plugin-wiki
```

## ⚙ Configuration

No special configuration is required as this plugin only reads data from the IQ.Wiki platform.

## 🚀 Usage

Import and initialize the plugin:

```javascript
import { createWikiPlugin } from "@iqai/plugin-wiki";

// Initialize the plugin
const plugin = await createWikiPlugin();
```

## 🎯 Actions

### 📄 IQ_WIKI

Fetch a specific wiki article by its ID.

#### 💬 Examples

- "Show me the wiki for bitcoin"
- "Get information about ethereum from IQ Wiki"

### 👤 USER_WIKIS

Retrieve wikis created by a specific user, with optional time filtering.

#### 💬 Examples

- "Show wikis by user 0x8AF7a19a26d8FBC48dEfB35AEfb15Ec8c407f889"
- "Get latest wikis from 0x1234...5678 in the last hour"
- "What wikis did 0xabcd...efgh create in the past 10 minutes?"

### 📊 USER_WIKI_ACTIVITIES

Retrieve all wiki activities (both creations and edits) by a specific user, with optional filtering by activity type and time period.

#### 💬 Examples

- "Show me wiki activities for 0x8AF7a19a26d8FBC48dEfB35AEfb15Ec8c407f889"
- "Get latest wiki edits from 0x1234...5678 in the last day"
- "Show wiki creations by 0xabcd...efgh in the past hour"

## 📜 Response Format

Actions return structured responses including:

- ✔ Wiki titles and summaries 📝
- ✔ Creation or edit timestamps 🕒
- ✔ Edit details (words changed, sections modified) for edited wikis 📊
- ✔ Source links to the original content 🔗
- ✔ Blockchain transaction links 🔗
- ✔ Error messages when applicable ⚠️

### Example Responses

#### Wiki Details

```bash
📜 Wiki Details
- Title: Bitcoin
- Summary: Bitcoin is a decentralized digital currency...

🔗 Source: https://iq.wiki/bitcoin
🔗 Transaction: https://polygonscan.com/tx/0x123...
```

#### Wiki Created

```bash
📜 Wiki Created
- Title: Ethereum
- Summary: Ethereum is a decentralized platform...
- Created: 5/5/2025, 11:03:26 PM

🔗 Source: https://iq.wiki/ethereum
🔗 Transaction: https://polygonscan.com/tx/0x456...
```

#### Wiki Edited

```bash
📜 Wiki Edited
- Title: Solana
- Summary: Solana is a high-performance blockchain...
- Edited: 5/6/2025, 1:26:58 AM
- Changes: 52 words (21.36%)
- Modified sections: content, tags

🔗 Source: https://iq.wiki/solana
🔗 Transaction: https://polygonscan.com/tx/0x789...
```

## ❌ Error Handling

The plugin handles various error scenarios:

- 🚨 Wiki not found
- 👤 User not found
- 🕒 No wikis or activities in specified time period
- 🌐 API connection issues
- 🛑 Input validation errors

## 🔄 Time Filtering

The plugin supports filtering by time period:

- ⏱️ Minutes: "in the last 10 minutes"
- ⏰ Hours: "in the past hour"
- 📅 Days: "in the last day"

This allows for monitoring recent wiki activity and staying up-to-date with the latest content.

## 🔍 Use Cases

- Research agents that need to retrieve specific information
- Monitoring bots that track new wiki content
- Social media agents that share recent wiki updates
- Knowledge assistants that provide information from IQ Wiki

This plugin serves as a bridge between AI agents and the decentralized knowledge base of IQ Wiki, enabling rich information retrieval and content exploration capabilities.

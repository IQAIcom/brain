# 🎛 Plugin Heartbeat

A **plugin** for scheduling automated messages and social media posts using cron-based timing.

---

## 📌 Overview

The **Plugin Heartbeat** provides a service for scheduling automated tasks that can:

✅ **Schedule periodic messages** ⏰  
✅ **Post to social media platforms** 📱  
✅ **Maintain continuous agent interactions** 🔄  
✅ **Support multiple concurrent schedules** 📅  

---

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-heartbeat
```

---

## ⚙ Configuration

The plugin requires configuration for clients. currently heartbeat plugin only supports twitter, telegram and webhook

| 🔧 Platform | 📜 Configuration Needed |
|------------|------------------------|
| **Twitter**  | N/A |
| **Telegram** | {chatId: string} |
| **Webhook**  | {url: string} |

---

## 🚀 Usage

Import and initialize the plugin:

```typescript
import { createHeartbeatPlugin } from "@iqai/plugin-heartbeat";

// Initialize the plugin with tasks
const plugin = await createHeartbeatPlugin([
  {
    period: "*/30 * * * * *",  // Cron schedule
    input: "Your message prompt",
    client: "telegram",        // Social platform
    config: {
      chatId: "your-chat-id"  // Platform-specific config
    }
  }
]);
```

---

## 🎯 Task Configuration

Each heartbeat task requires:

✔ **period**: Cron expression for scheduling  
✔ **input**: Message prompt for the agent  
✔ **client**: Target platform (**"telegram"**,  **"twitter"**, **"webhook"**)  
✔ **config**: Platform-specific configuration  

### 💬 Example Tasks

```json
[
  {
    "period": "*/30 * * * * *",    // Every 30 seconds
    "input": "Post a crypto joke",
    "client": "telegram",
    "config": { "chatId": "-1234567890" }
  },
  {
    "period": "0 */1 * * *",       // Every hour
    "input": "Market update post",
    "client": "twitter"
  }
]
```

---

## 📜 Response Handling

The plugin handles responses by:

✔ **Processing agent responses** 🤖  
✔ **Posting to specified platforms** 📤  
✔ **Maintaining message history** 📝  
✔ **Storing interactions in memory** 💾  

---

## ❌ Error Handling

The plugin manages various scenarios:

🚨 **Missing client configurations**  
🌐 **Network connection issues**  
📡 **Platform API failures**  
⏰ **Schedule execution errors**  

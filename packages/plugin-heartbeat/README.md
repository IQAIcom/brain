# 💓 Plugin Heartbeat

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

The plugin requires configuration for clients. Currently heartbeat plugin supports Twitter, Telegram, and callback functions.

| 🔧 Platform | 📜 Configuration Needed |
|------------|------------------------|
| **Twitter**  | `{ type: "twitter" }` |
| **Telegram** | `{ type: "telegram", chatId: string }` |
| **Callback**  | `{ type: "callback", callback: (content: string, roomId: string) => Promise<void> }` |

Use callback to handle the message with your own logic.

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
    clients: [
      {
        type: "telegram",
        chatId: "your-chat-id"
      }
    ]
  }
]);
```

---

## 🎯 Task Configuration

Each heartbeat task requires:

✔ **period**: Cron expression for scheduling  
✔ **input**: Message prompt for the agent  
✔ **clients**: Array of target platforms (Twitter, Telegram, callback)  
✔ **onlyFinalOutput** (optional): Boolean to determine if only the final output should be used  
✔ **shouldPost** (optional): Function to determine if response should be posted  
✔ **formatResponse** (optional): Function to format the response before posting  

### 💬 Example Tasks

```json
[
  {
    "period": "*/30 * * * * *",    // Every 30 seconds
    "input": "Post a crypto joke",
    "clients": [
      {
        "type": "telegram",
        "chatId": "-1234567890"
      }
    ]
  },
  {
    "period": "0 */1 * * *",       // Every hour
    "input": "Market update post",
    "clients": [
      {
        "type": "twitter"
      },
      {
        "type": "telegram",
        "chatId": "-1234567890"
      }
    ],
    "onlyFinalOutput": true
  },
  {
    "period": "0 12 * * *",        // Every day at noon
    "input": "Generate daily report",
    "clients": [
      {
        "type": "callback",
        "callback": async (content, roomId) => {
          // Custom handling logic
          console.log(`Received content for room ${roomId}: ${content}`);
        }
      }
    ],
    "shouldPost": (response) => response.length > 100,
    "formatResponse": async (response, runtime) => {
      // Custom formatting logic
      return `📊 DAILY REPORT 📊\n\n${response}`;
    }
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

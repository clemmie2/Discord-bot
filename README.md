# 🛡️ Discord Moderation Bot

A powerful Discord moderation bot with slash commands, similar to Wick Bot.

## Features

### Moderation Commands
| Command | Description | Required Permission |
|---------|-------------|---------------------|
| `/ban` | Ban a member, optionally delete their messages | Ban Members |
| `/unban` | Unban a user by their ID | Ban Members |
| `/softban` | Ban + unban to kick and delete messages | Ban Members |
| `/kick` | Kick a member | Kick Members |
| `/mute` | Timeout a member (10s, 5m, 1h, 28d, etc.) | Moderate Members |
| `/unmute` | Remove a timeout | Moderate Members |
| `/warn` | Issue a formal warning | Moderate Members |
| `/warnings list/clear/remove` | Manage warnings | Moderate Members |
| `/banlist` | View all banned users | Ban Members |

### Message Management
| Command | Description | Required Permission |
|---------|-------------|---------------------|
| `/purge` | Bulk delete up to 100 messages | Manage Messages |

### Channel & Role Management
| Command | Description | Required Permission |
|---------|-------------|---------------------|
| `/slowmode` | Set channel slowmode | Manage Channels |
| `/lockdown lock/unlock` | Lock/unlock a channel | Manage Channels |
| `/nick` | Change a member's nickname | Manage Nicknames |
| `/role add/remove` | Add/remove roles | Manage Roles |

### AutoMod
| Command | Description |
|---------|-------------|
| `/automod status` | View current settings |
| `/automod antispam` | Toggle spam detection |
| `/automod antilinks` | Block external links |
| `/automod antiinvites` | Block Discord invites |
| `/automod antimention` | Block mass mentions |
| `/automod anticaps` | Block excessive caps |
| `/automod antiprofanity` | Block banned words |
| `/automod addword/removeword` | Manage banned word list |
| `/automod logchannel` | Set log channel for AutoMod |

### Info Commands
- `/userinfo` — View detailed user info + warning count
- `/serverinfo` — View detailed server info
- `/help` — List all commands

---

## Setup

### Prerequisites
- Node.js 18 or higher
- A Discord bot application ([Discord Developer Portal](https://discord.com/developers/applications))

### Required Bot Permissions
Make sure your bot has these permissions in your server:
- Ban Members
- Kick Members
- Moderate Members (for timeouts)
- Manage Messages
- Manage Channels
- Manage Nicknames
- Manage Roles
- Read Messages / View Channels
- Send Messages
- Embed Links

### Required Bot Intents (enable in Developer Portal → Bot → Privileged Gateway Intents)
- ✅ Server Members Intent
- ✅ Message Content Intent
- ✅ Presence Intent

---

## Installation

### 1. Clone and install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your values:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_application_id_here
GUILD_ID=your_server_id_here_optional
```

- `DISCORD_TOKEN` — Your bot token from the Developer Portal
- `CLIENT_ID` — Your bot's Application ID (found in Developer Portal → General Information)
- `GUILD_ID` — Optional: your server ID for instant command registration during testing

### 3. Register Slash Commands
```bash
npm run deploy-commands
```

- With `GUILD_ID` set: commands register **instantly** to that server (great for testing)
- Without `GUILD_ID`: commands register **globally** (takes up to 1 hour to propagate)

### 4. Start the bot
```bash
npm start
```

---

## Hosting on Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo or use the Railway CLI to deploy
3. Set these environment variables in Railway's settings:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
4. Set the **Start Command**: `npm start`
5. Deploy!

## Hosting on JustRunMyApp

1. Upload the `discord-bot` folder
2. Set `npm install` as the install command
3. Set `npm start` as the start command
4. Add environment variables: `DISCORD_TOKEN`, `CLIENT_ID`
5. Deploy!

---

## Notes

- **Warnings are stored in memory** — they reset when the bot restarts. For persistence across restarts, you would need to connect a database.
- **AutoMod settings are also in memory** — same note applies.
- The bot DMs users when they are banned, kicked, or muted (fails silently if DMs are closed).
- All moderation commands check role hierarchy — the bot and the moderator must be higher than the target.

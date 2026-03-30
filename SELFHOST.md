# Self-Hosting Yuudachi

## Prerequisites

- A VPS (I use [Contabo](https://contabo.com)) or server with Docker and Docker Compose installed
- A Discord bot application ([Discord Developer Portal](https://discord.com/developers/applications))
- Git

## 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click New Application and give it a name
3. Go to Bot -> click Reset Token and copy the token
4. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
5. Go to Installation -> check Guild Install only

## 2. Clone the Repository

```bash
git clone https://github.com/ArhanCodes/yuudachi.git
cd yuudachi
```

## 3. Create the Environment File

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DISCORD_TOKEN=your_bot_token_here
PGPASSWORD=your_secure_database_password
API_PORT=3003
API_JWT_SECRET=your_random_jwt_secret
LOGGER_NAME=yuudachi
```

## 4. Build and Start

```bash
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

This starts:
- PostgreSQL — database
- Redis — caching and job queues
- Migrations — sets up database tables automatically
- Bot — the Discord bot

## 5. Register Slash Commands

Run this once after first deploy (and again whenever commands change):

```bash
docker compose -f docker-compose.production.yml --profile deploy run --rm deploy-commands
```

## 6. Invite the Bot

Replace `YOUR_CLIENT_ID` with your application's client ID from the Developer Portal:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=1494984439878&scope=bot+applications.commands
```

## 7. Verify

Check the bot logs:

```bash
docker compose -f docker-compose.production.yml logs bot --tail 20
```

You should see the bot log in and register commands

## Useful Commands

View logs:
```bash
docker compose -f docker-compose.production.yml logs bot --tail 50 -f
```

Restart the bot:
```bash
docker compose -f docker-compose.production.yml restart bot
```

Stop everything:
```bash
docker compose -f docker-compose.production.yml down
```

Update to latest version:
```bash
git pull
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml --profile deploy run --rm deploy-commands
```

View database:
```bash
docker compose -f docker-compose.production.yml exec postgres psql -U postgres
```

## Troubleshooting

Bot says "application did not respond":
- Check logs for errors: `docker compose -f docker-compose.production.yml logs bot --tail 30`
- Make sure all intents are enabled in the Developer Portal
- Restart the bot: `docker compose -f docker-compose.production.yml restart bot`

Slash commands not showing up:
- Re-register them: `docker compose -f docker-compose.production.yml --profile deploy run --rm deploy-commands`
- Wait a few minutes — Discord can take time to propagate guild commands

Database connection errors:
- Make sure PostgreSQL is healthy: `docker compose -f docker-compose.production.yml ps`
- Check if migrations ran: `docker compose -f docker-compose.production.yml logs migrate`

Build failures:
- Try a clean build: `docker compose -f docker-compose.production.yml build --no-cache`


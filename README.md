# Telegram Capture — Vercel Deployment

**For authorized security testing only.**

## Deploy to Vercel (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USER/telegram-capture&env=TELEGRAM_BOT_TOKEN&envDescription=Get%20a%20bot%20token%20from%20%40BotFather%20on%20Telegram)

## Manual Setup

### 1. Create Telegram Bot
- Open Telegram → search **@BotFather**
- Send `/newbot` → follow prompts → **save the bot token**

### 2. Deploy

```bash
npm install -g vercel
git clone <your-repo>
cd telegram-capture
vercel --prod


<p align="center">
  <img src="assets/aladdin-demo.gif" alt="Aladdin Loot Deals Demo GIF" width="100%">
  <br>
</p>

<br>

<div align="center">

# 🧞 Aladdin Loot Deals

### Your ultimate deal-curation & social-sharing command center

Scrape → Curate → Add Affiliate Links → Share to Social Media

<br>

[![Expo SDK 54](https://img.shields.io/badge/Expo%20SDK-54-blueviolet?logo=expo)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)]()
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)]()
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase)]()
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)]()

</div>

---

## 🪄 What is Aladdin?

Aladdin is an **end-to-end deal curation platform** for affiliate marketers & discount hunters. It automates the entire lifecycle of sharing deals on social media:

| Step | What happens |
|------|-------------|
| **1. Scrape** 🤖 | Browser bots crawl **Amazon.in** & **Flipkart** to find the hottest deals |
| **2. Curate** 🎯 | Browse, search, filter, and hand-pick products from your mobile app |
| **3. Set Affiliate Links** 🔗 | Attach your affiliate URLs to earn commissions |
| **4. Share** 📢 | Post polished deal collages to **Telegram, Instagram, Facebook, & X** |

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────┐
                    │    📱 Aladdin App         │
                    │  (React Native / Expo)    │
                    │   Deal curation & share   │
                    └────────┬─────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│   🔍 Scrapper   │  │  📸 Screenshot  │  │  🚀 Edge     │
│   (Playwright)  │  │  (Puppeteer)    │  │  Function    │
│   Crawls deals  │  │  Captures       │  │  (Deno)      │
│   on Amazon/    │  │  product images │  │  Posts to    │
│   Flipkart      │  │  with BullMQ    │  │  Telegram    │
└────────┬────────┘  └────────┬────────┘  └──────┬───────┘
         │                    │                   │
         ▼                    ▼                   ▼
    ┌─────────────────────────────────────────────────┐
    │          ☁️  Supabase + Redis + Docker           │
    │     Database · Auth · Storage · Queues          │
    └─────────────────────────────────────────────────┘
```

---

## 📦 The Apps (What's Inside)

### 1. 📱 Mobile App — `apps/android`
**React Native + Expo** app for deal curators. Browse scraped products, search & filter, add affiliate links, select multiple deals, generate shareable image collages with watermark, and post to social media in one tap.

<details>
<summary><b>✨ Key Features</b></summary>

| Feature | Detail |
|---------|--------|
| Auth | Email/password via Supabase Auth |
| Product Feed | Infinite-scroll FlatList with search & category filters |
| Deal Selection | Long-press to select, batch share or delete (up to 16) |
| Affiliate Links | Add/remove/set-default per product |
| Collage Generator | Auto-merge product images into a shareable grid |
| Caption Editor | AI-augmented captions + hashtag suggestions |
| Multi-Platform Share | Telegram · Instagram · Facebook · X in one go |

</details>

### 2. 🤖 Scrapper Service — `apps/scrapper`
**Playwright + Express** service that autonomously crawls **Amazon.in** and **Flipkart** to find discounted products. Runs with smart catalog rotation across 15+ categories, deduplicates via Redis, and enqueues screenshot jobs.

<details>
<summary><b>✨ Key Features</b></summary>

| Feature | Detail |
|---------|--------|
| Dual Engine | Separate scrapers optimized for Amazon.in & Flipkart |
| Catalog Rotation | Fair scheduling across 55+ subcategories |
| Brand Grouping | Automatically groups products by brand |
| Price Validation | Filters by discount %, price range, and availability |
| Anti-Detection | Random user-agents & human-like delays |
| Fire & Forget | Async API returns immediately, scrapes in background |

</details>

### 3. 📸 Screenshot Service — `apps/screenshot`
**Puppeteer + BullMQ** microservice that takes product screenshots. Supports two modes — **Full** (product detail page crop) and **Grouped** (search results grid with price validation). Uploads results directly to Supabase Storage.

<details>
<summary><b>✨ Key Features</b></summary>

| Feature | Detail |
|---------|--------|
| Full Screenshot | Crops product image + price section from detail page |
| Grouped Screenshot | Captures up to 4 valid product cards from search results |
| Sponsored Filter | Removes sponsored/ads cards automatically |
| Price Validation | Only captures products within specified price range |
| Concurrency | BullMQ queue with 5 parallel jobs + retry queue |

</details>

### 4. 🚀 Edge Function — `apps/edge-function`
**Deno + Telegram Bot API** serverless function that bridges Aladdin to Telegram. Called by the mobile app to post deal collages with captions & hashtags directly to your Telegram channel.

<details>
<summary><b>✨ Key Features</b></summary>

| Feature | Detail |
|---------|--------|
| Single Purpose | Posts product image + caption to Telegram |
| HTML Captions | Supports rich formatting in captions |
| Graceful Skip | Silently skips if Telegram is not selected |
| CORS Enabled | Accepts cross-origin requests |

</details>

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- pnpm / bun / npm
- Supabase account
- Redis

### 1️⃣ Clone & Install
```bash
git clone https://github.com/your-username/aladdin-project.git
cd aladdin-project

# Install dependencies per app
cd apps/android && bun install      # Mobile app
cd ../scrapper && pnpm install      # Scrapper
cd ../screenshot && pnpm install    # Screenshot service
```

### 2️⃣ Set Up Environment
```bash
cp .env.example .env
# Fill in your Supabase credentials, Redis config, and platform IDs
```

### 3️⃣ Run with Docker (Infrastructure)
```bash
docker compose up -d
```
Starts Redis, Scrapper, and Screenshot service together.

### 4️⃣ Start the Mobile App
```bash
cd apps/android
npx expo start
```

### 5️⃣ Deploy Edge Function
```bash
cd apps/edge-function
supabase functions deploy share-product
```

---

## 🧭 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Scrapper, Screenshot | Supabase project URL |
| `SUPABASE_KEY` | Scrapper, Screenshot, Mobile | API/anon key |
| `REDIS_HOST` / `PORT` / `PASSWORD` | Scrapper, Screenshot | Redis cache & queue config |
| `USER_ID` | Root `.env` | Default owner identifiers |
| `AMAZON_PLATFORM_ID` / `FLIPKART_PLATFORM_ID` | Root `.env` | Platform DB references |
| `TELEGRAM_BOT_TOKEN` / `CHAT_ID` | Edge Function | Telegram integration |
| `EXPO_PUBLIC_SUPABASE_*` | Mobile app | Supabase client config |

---

## 🧩 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native 0.81 · Expo SDK 54 · Zustand · TanStack Query |
| **Scraper** | Node.js 22 · Playwright · Express 5 · Zod |
| **Screenshot** | Node.js 22 · Puppeteer · BullMQ · ioredis |
| **Edge Function** | Deno · Telegram Bot API · Supabase Functions |
| **Database** | Supabase (PostgreSQL + Storage) |
| **Cache/Queue** | Redis 8 |
| **Infra** | Docker Compose · EAS Build |

---

## 📄 License

[MIT](LICENSE)

---

<div align="center">
  Made with 🧞‍♂️ by affiliate marketers, for affiliate marketers
</div>

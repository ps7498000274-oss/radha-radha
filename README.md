# 🌸 Radha Radha — Personal Naam Jap Tracker

> **“राधे राधे”** — *Har Naam, Ek Kadam Apne Lakshya Ki Or.*  
> A peaceful, modern, privacy-first web application designed for devotees to record daily Radha naam jap, maintain spiritual momentum, achieve lifetime milestones, and immerse in devotional audio.

---

## 🌟 Key Features

1. **Authentication & Absolute Privacy**:
   - Built with **Supabase Auth** (Email & Password, verification, secure password reset).
   - **PostgreSQL Row-Level Security (RLS)** strictly enforced on every user table. Every devotee's sadhana records are completely private.
   - Zero public leaderboards, zero shared counts.

2. **Personal Dashboard (12 Real-Time Metrics)**:
   - Total Lifetime Jap Count (formatted in the Indian numbering system: *1,00,000*, *1,00,00,000*).
   - Today's Jap & Daily Goal comparison.
   - Current Target & Remaining Jap to goal.
   - Real-time Completion Percentage with animated progress indicators.
   - Current Daily Streak (🔥) and All-Time Best Streak.
   - Average Jap per Active Chanting Day vs Average per Calendar Day.
   - Pacing Forecast: Estimated Days Remaining & Projected Target Completion Date.
   - Total Days with Jap Activity.

3. **Cumulative Lifetime Milestones**:
   - **1 Crore** (1,00,00,000)
   - **3 Crore** (3,00,00,000)
   - **5 Crore** (5,00,00,000)
   - **12 Crore** (12,00,00,000 — Supreme Dedication)
   - Cumulative counting: completing 1 Crore never resets your count when progressing toward 3 Crore.
   - Ability to create custom personal targets with celebration badges upon completion.

4. **Daily Jap Entry Page**:
   - Quick-add helpers: `+108`, `+1,008`, `+5,000`, `+10,000`.
   - Large touch-friendly numeric input.
   - Clear choice between **"Add More"** and **"Set Today's Total"** to prevent accidental overwrites.
   - Database uniqueness constraint on `(user_id, entry_date)`.
   - Personal spiritual reflections & notes field.

5. **Deep Visual Analytics & Forecasting**:
   - **Interactive Recharts**: Daily trajectory line/area charts with filters (`7d`, `30d`, `90d`, `1y`, `All`).
   - **Weekly & Monthly Comparisons**: Week-over-week difference, percentage shift, daily bar breakdown.
   - **52-Week Sadhana Heatmap**: GitHub-style calendar matrix showing chant density.
   - **Goal Forecasting**: Dynamic projections calculated using 7-day pace, 30-day pace, historical average, and user-defined custom daily targets.

6. **Continuous Devotional Audio**:
   - Global persistent audio player that continues playing seamlessly while navigating across all authenticated pages.
   - Audio mini-player docked at the bottom of the screen.
   - Browser autoplay policy handling with clear manual activation fallback.
   - Volume control, mute, and infinite repeat loop.
   - Configurable stream/file URL via `VITE_AUDIO_URL` or local `public/audio/radha-naam.mp3`.

7. **Devotional Theme & UI/UX**:
   - Palette: Royal Indigo (`#4338ca`), Midnight Navy (`#0f172a`), Lavender (`#c4b5fd`), Warm Cream (`#fef7ed`), and Subtle Gold (`#d4a843`).
   - Sacred Devanagari typography: **“राधे राधे”**.
   - Fully responsive for mobile, tablet, and desktop.
   - Light and Dark modes.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + custom Devotional Design Tokens + Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Routing**: React Router v6
- **Forms & Validation**: React Hook Form + Zod
- **Date Handling**: date-fns

---

## 🚀 Getting Started Locally (Windows / macOS / Linux)

### 1. Prerequisites
- **Node.js** (v18 or v20+ recommended)
- **npm** (comes with Node.js)

### 2. Install Dependencies
Open PowerShell or your terminal in the project directory:
```bash
npm install
```

### 3. Configure Supabase Environment
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `radha-radha`.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. In your Supabase Project Settings > API, copy your **Project URL** and **anon public key** into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   VITE_AUDIO_URL=/audio/radha-naam.mp3
   ```

### 4. Run SQL Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql` from this repository.
3. Copy the entire contents, paste into the SQL Editor, and click **Run**.
   - This creates all 4 tables (`profiles`, `daily_jap_entries`, `user_targets`, `user_settings`).
   - Configures all Row Level Security (RLS) policies.
   - Sets up triggers for auto-creating devotee profiles and default milestones upon signup.

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Row Level Security (RLS) Verification

Each table is locked down with PostgreSQL RLS:
- **`profiles`**: `WHERE id = auth.uid()`
- **`daily_jap_entries`**: `WHERE user_id = auth.uid()`
- **`user_targets`**: `WHERE user_id = auth.uid()`
- **`user_settings`**: `WHERE user_id = auth.uid()`

Devotee A cannot view, edit, or delete Devotee B's counts or notes under any circumstances.

---

## 🎧 Devotional Audio Setup

Place any legal, licensed devotional audio file inside:
```
public/audio/radha-naam.mp3
```
Alternatively, set any streaming audio URL in `.env`:
```env
VITE_AUDIO_URL=https://your-cdn.com/radha-naam-dhun.mp3
```

---

## 📦 Building for Production

```bash
npm run build
```
This produces an optimized production bundle in `dist/`. The project is zero-config ready for deployment on **Vercel**, **Netlify**, or **Cloudflare Pages**.

---

## 🙏 Dedication
*“निःस्वार्थ भाव से श्री राधा नाम का जप ही परम कल्याणकारी है।”*  
May this tool support your daily sadhana with peace, regularity, and love.

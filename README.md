# ✨ NicheSpark — AI Content Productivity Coach

> **AWS Builder Challenge · July 2025**  
> Built with **Kiro** (spec-driven AI IDE) + **Amazon Bedrock** (Claude 3) + **AWS Amplify**

**One-sentence pitch:** NicheSpark ends "what should I post?" paralysis — it takes your niche and runs a 4-step Amazon Bedrock AI chain to generate 7 virality-scored, ready-to-post content ideas and a full 7-day calendar, personalised to your voice and audience, in under 40 seconds.

---

## 🎬 Live Demo

> **[nichespark.amplifyapp.com](https://nichespark.amplifyapp.com)** ← replace after Amplify deploy

---

## 🧠 What Makes This an AI Productivity Tool

Most AI content tools are a single ChatGPT prompt. NicheSpark chains **4 dedicated Bedrock calls** that build on each other:

| Step | What the AI does |
|------|-----------------|
| **1 · Research** | Analyses trending content formats and virality patterns in your specific niche |
| **2 · Analyse** | Extracts your unique virality signals from your profile, voice, and example posts |
| **3 · Generate** | Writes 7 fully tailored ideas — hook, caption, visual description, CTA, hashtags |
| **4 · Score** | Self-critiques each idea, sharpens hooks, improves captions, assigns virality score 1–10 with reasoning |

The onboarding is also AI-driven:

- **Step 1** → Types niche → AI instantly builds target avatar + 3 content angles (live preview while typing)
- **Step 2** → Audience description → AI predicts pain points, objections, desired outcome
- **Step 3** → Platform selection → AI generates platform-specific strategy (format, hook style, length, posting time)
- **Step 4** → Voice selection → locked into AI system prompt for every future generation
- **Step 5** → Example post → AI generates a full **7-day content calendar** before the user even reaches the app

---

## 🏗️ Architecture

```
Browser (React + Vite + Tailwind)
    │
    ├── AWS Amplify Hosting (CI/CD from GitHub)
    │
    └── Two AI modes:
        ├── LOCAL DEV: Direct Bedrock via AWS SDK (VITE_AWS_ACCESS_KEY_ID)
        └── PRODUCTION: API Gateway → Lambda → Bedrock + DynamoDB
                           │
                           ├── /generate  → 4-step Claude chain
                           ├── /profile   → DynamoDB CRUD
                           └── /history   → Session storage
```

### AWS Services Used

| Service | Purpose |
|---------|---------|
| **Amazon Bedrock** (Claude 3 Haiku) | 4-step AI chain + per-idea refinement + onboarding AI |
| **AWS Lambda** (Node 20) | Secure backend — Bedrock calls never expose credentials to browser |
| **API Gateway** (HTTP API) | REST endpoints for generate, profile, history |
| **Amazon DynamoDB** | Creator profiles + session history (on-demand billing) |
| **AWS Amplify** | Frontend hosting + CI/CD from GitHub |
| **AWS SAM** | Infrastructure as code |
| **Kiro** | Spec-driven development — how the entire app was built |

---

## 🚀 Features

- **AI-powered onboarding** — 5 steps, each triggering background Bedrock analysis
- **4-step idea generation** — Research → Analyse → Generate → Score
- **7-day content calendar** — Full week of posts with hooks, body copy, hashtags, virality scores
- **Per-card AI refinement** — 5 modes: More viral · Shorten for Reels · Add story · Professional · Contrarian
- **One-click copy** — Hook + caption + CTA + hashtags assembled instantly
- **25-min Pomodoro timer** — Productivity guardrail with milestone nudges
- **Creation streak tracker** — Dashboard with stats, history, best-performing ideas
- **Mock mode** — Runs fully offline with no AWS credentials (for demos)

---

## 📁 Project Structure

```
nichespark/
├── frontend/                    # React 18 + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx       # Marketing page
│   │   │   ├── OnboardingPage.tsx    # AI-driven 5-step wizard
│   │   │   ├── GeneratePage.tsx      # Main generator + calendar
│   │   │   ├── DashboardPage.tsx     # Stats + streaks
│   │   │   ├── HistoryPage.tsx       # Past sessions
│   │   │   └── SettingsPage.tsx      # Profile editor
│   │   ├── components/
│   │   │   ├── AppShell.tsx          # Sidebar layout
│   │   │   ├── IdeaCard.tsx          # Idea card with refine menu
│   │   │   ├── ContentCalendarView.tsx # 7-day calendar grid
│   │   │   ├── PomodoroTimer.tsx     # 25-min productivity timer
│   │   │   └── ui/                   # shadcn-style base components
│   │   ├── lib/
│   │   │   ├── bedrock.ts            # Direct Bedrock client (local dev)
│   │   │   ├── aiChain.ts            # 4-step generation chain
│   │   │   ├── onboardingAI.ts       # Step-by-step onboarding AI
│   │   │   ├── api.ts                # Unified API layer (lambda/bedrock/mock)
│   │   │   ├── mockApi.ts            # Offline demo data
│   │   │   └── storage.ts            # localStorage helpers
│   │   └── types/index.ts            # Shared TypeScript types
│   ├── .env.example                  # Environment variable template
│   └── amplify.yml                   # Amplify build config
│
├── backend/                     # AWS Lambda functions (TypeScript)
│   └── functions/
│       ├── generateIdeas/        # Bedrock chain orchestrator
│       │   ├── index.ts          # Lambda handler
│       │   └── bedrock.ts        # 4-step chain (server-side)
│       ├── saveProfile/          # DynamoDB profile CRUD
│       ├── getHistory/           # Session history query
│       └── shared/types.ts       # Shared types
│
├── infra/
│   └── template.yaml             # SAM template (API GW + Lambda + DynamoDB)
│
└── docs/
    └── requirements.md           # Full requirements spec
```

---

## 🛠️ Local Development

### Prerequisites
- Node 18+ (`node --version`)
- AWS CLI configured (`aws configure`) — for real Bedrock calls
- SAM CLI — for backend deploy (`winget install Amazon.SAM-CLI`)

### 1. Frontend (mock mode — no AWS needed)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

The app runs in **mock mode** by default — all AI responses are simulated locally.

### 2. Frontend with real Amazon Bedrock

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=YOUR_KEY
VITE_AWS_SECRET_ACCESS_KEY=YOUR_SECRET
VITE_BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
```

> **IAM requirement:** Your user needs `AmazonBedrockFullAccess`  
> **Model access:** Enable Claude 3 Haiku in [Bedrock Console → Model access](https://console.aws.amazon.com/bedrock/home#/modelaccess) (us-east-1)

Then restart the dev server — the amber "Mock mode" badge disappears and real AI activates.

### 3. Backend (SAM deploy)

```bash
cd backend
npm install
npm run build          # compiles TypeScript → dist/

cd ../infra
sam build
sam deploy --guided    # follow prompts, note the ApiUrl output
```

Copy the `ApiUrl` output into `frontend/.env.local`:
```env
VITE_API_URL=https://YOUR_ID.execute-api.us-east-1.amazonaws.com/prod
```

---

## ☁️ Deploy to AWS Amplify

### Option A — Amplify Console (recommended)

1. Push this repo to GitHub (you're reading the result)
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click **"New app" → "Host web app"**
4. Connect your GitHub repo, select the `main` branch
5. Set **App root directory** to `frontend`
6. Add environment variables:
   ```
   VITE_AWS_REGION     = us-east-1
   VITE_API_URL        = https://YOUR_API_GATEWAY_URL/prod
   ```
   > Do NOT add `VITE_AWS_ACCESS_KEY_ID` to Amplify — use the Lambda backend in production
7. Click **Save and deploy**

Amplify reads `frontend/amplify.yml` automatically:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
```

### Option B — Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

---

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_AWS_REGION` | For Bedrock mode | AWS region (us-east-1 recommended) |
| `VITE_AWS_ACCESS_KEY_ID` | For Bedrock mode | IAM access key — local dev only |
| `VITE_AWS_SECRET_ACCESS_KEY` | For Bedrock mode | IAM secret — local dev only |
| `VITE_BEDROCK_MODEL` | Optional | Model ID (defaults to Claude 3 Haiku) |
| `VITE_API_URL` | For Lambda mode | API Gateway endpoint URL |

**Never commit `.env.local`** — it's in `.gitignore`.

---

## 🧪 AI Modes

The app auto-detects which mode to use:

```
VITE_API_URL set      → Lambda mode (production)
VITE_AWS_ACCESS_KEY_ID set → Bedrock direct (local dev with real AI)  
Neither set           → Mock mode (offline demo, no AWS needed)
```

The mode is shown in the Generate page header and the top bar.

---

## 📝 Builder Center Article

> *"I ended 'what should I post?' paralysis with Kiro + Amazon Bedrock — built in one weekend"*

Key points covered:
- Why raw ChatGPT fails creators (no memory, no niche awareness, single prompts)
- How chaining 4 Bedrock calls produces dramatically better output
- Kiro's spec-driven approach: Requirements → Design → Tasks → Implementation
- The onboarding AI trick: background analysis at every step
- AWS Free Tier compatibility: DynamoDB on-demand + Lambda + Amplify free tier

---

## 🏆 AWS Builder Challenge Submission

- **Category:** AI Productivity Tool
- **Core AWS services:** Bedrock · Lambda · DynamoDB · Amplify
- **Built with:** Kiro (spec-driven AI IDE)
- **Differentiator:** 4-step chained AI prompts + persistent creator profile + onboarding AI at every step

---

## 📄 License

MIT — free to use, fork, and build on.

---

*Built by [Abbey256](https://github.com/Abbey256) · AWS Builder Challenge · July 2025*

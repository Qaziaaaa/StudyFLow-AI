# StudyFlow AI

**StudyFlow AI** is a single-page web application that converts a student's assignment details into a structured, day-by-day study plan powered by the Groq API (Llama 3.3).

Enter an assignment title, description, and due date — and the app returns a prioritised plan with a task breakdown, time estimates, difficulty ratings, and a daily schedule.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | _Add your Vercel URL here_ |
| Backend API (Render) | _Add your Render URL here_ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Testing | Vitest, fast-check (property-based), React Testing Library |

---

## Project Structure

```
studyflow-ai/
├── client/          # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentForm.tsx
│   │   │   ├── LoadingIndicator.tsx
│   │   │   └── ResultsSection.tsx
│   │   └── App.tsx
│   └── vercel.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/generatePlan.ts
│   │   ├── groqClient.ts
│   │   ├── priorityEngine.ts
│   │   ├── scheduleBuilder.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   └── .env.example
├── shared/
│   └── types.ts     # Shared TypeScript interfaces
└── package.json     # npm workspaces root
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Qaziaaaa/StudyFLow-AI.git
cd StudyFLow-AI

# 2. Install all dependencies (workspaces)
npm install

# 3. Create the server environment file
cp server/.env.example server/.env
# Then edit server/.env and add your GROQ_API_KEY

# 4. Start both dev servers in separate terminals
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173
```

The Vite dev server proxies `/generate-plan` requests to `localhost:3001` automatically.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key from console.groq.com |
| `PORT` | ❌ | Port to listen on (default: 3001) |
| `CORS_ORIGIN` | ❌ | Allowed frontend origin in production (e.g. `https://your-app.vercel.app`) |

### Client (`client/.env` — Vercel environment variable)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ in prod | Full URL of the Render backend (e.g. `https://studyflow-ai-api.onrender.com`) |

---

## Deployment

### Backend → Render (Web Service)

1. Go to [render.com](https://render.com) → **New Web Service** → connect this GitHub repo
2. Fill in the fields:

| Field | Value |
|---|---|
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |

3. Add environment variables in Render's dashboard:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `CORS_ORIGIN` | Your Vercel frontend URL (set this after deploying the frontend) |

4. Deploy. Copy the service URL — you'll need it for the frontend.

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import this GitHub repo
2. Fill in the fields:

| Field | Value |
|---|---|
| **Root Directory** | `client` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

3. Add environment variables in Vercel's dashboard:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://studyflow-ai-api.onrender.com`) |

4. Deploy.

5. After deployment, go back to **Render** and set `CORS_ORIGIN` to your Vercel URL, then redeploy the Render service.

---

## Running Tests

```bash
# All tests
npm test

# Server only
npm run test:server

# Client only
npm run test:client
```

---

## How It Works

1. Student fills in assignment title, description, and due date
2. Client validates inputs and POSTs to `/generate-plan`
3. Server validates the request and calls the Groq API with a structured prompt
4. The AI response is validated, then enriched:
   - **PriorityEngine** assigns High / Medium / Low based on days remaining
   - **ScheduleBuilder** distributes tasks across calendar days
5. The complete study plan is returned to the frontend and displayed

---

## License

MIT

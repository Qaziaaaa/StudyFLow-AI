import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generatePlanRouter } from "./routes/generatePlan";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// In production, only allow requests from the deployed frontend origin.
// Set CORS_ORIGIN env var on Render to your Vercel URL, e.g. https://studyflow-ai.vercel.app
// Leave unset (or set to *) for local development.
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/", generatePlanRouter);

// Health-check endpoint — Render uses this to verify the service is up
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`StudyFlow AI server listening on port ${PORT}`);
});

export default app;

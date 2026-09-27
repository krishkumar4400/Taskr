import express from "express";
import { Queue } from "bullmq";
import { query } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const connection = { url: process.env.REDIS_URL };
const jobQueue = new Queue("taskr-jobs", { connection });

app.post("/jobs", async (req, res) => {
  const { type, payload, priority = 5 } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: "type and payload required" });
  }

  // Postgres mein record banao
  const result = await query(
    `INSERT INTO jobs (type, payload, status) VALUES ($1, $2, 'pending') RETURNING *`,
    [type, payload],
  );
  const job = result.rows[0];

  // Redis queue mein daalo
  await jobQueue.add(type, { jobId: job.id, type, payload }, { priority });

  res.status(201).json({ jobId: job.id, status: "queued" });
});

app.get("/jobs/:id", async (req, res) => {
  const result = await query("SELECT * FROM jobs WHERE id = $1", [
    req.params.id,
  ]);
  if (!result.rows.length) return res.status(404).json({ error: "not found" });
  res.json(result.rows[0]);
});

app.listen(process.env.PORT, () => {
  console.log(`Taskr API running on port ${process.env.PORT}`);
});

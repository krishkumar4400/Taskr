import { Worker } from "bullmq";
import { query } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const connection = { url: process.env.REDIS_URL };

const worker = new Worker(
  "taskr-jobs",
  async (job) => {
    const { jobId, type, payload } = job.data;

    console.log(`[Worker] Processing job ${jobId} | type: ${type}`);

    // Status update karo — in-progress
    await query(
      `UPDATE jobs SET status = 'in_progress', attempts = attempts + 1, updated_at = NOW() WHERE id = $1`,
      [jobId],
    );

    // Yahan actual kaam hoga — abhi sirf simulate karte hain
    await handleJob(type, payload);

    // Done
    await query(
      `UPDATE jobs SET status = 'completed', updated_at = NOW() WHERE id = $1`,
      [jobId],
    );

    console.log(`[Worker] Job ${jobId} completed`);
  },
  {
    connection,
    concurrency: 5, // ek saath 5 jobs
  },
);

async function handleJob(type, payload) {
  switch (type) {
    case "send_email":
      console.log(`Sending email to ${payload.to}`);
      await sleep(1000); // simulate kaam
      break;

    case "generate_report":
      console.log(`Generating report: ${payload.reportName}`);
      await sleep(2000);
      break;

    default:
      console.log(`Unknown job type: ${type}`);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

worker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job.data.jobId} failed:`, err.message);
  await query(
    `UPDATE jobs SET status = 'failed', updated_at = NOW() WHERE id = $1`,
    [job.data.jobId],
  );
});

console.log("[Worker] Waiting for jobs...");

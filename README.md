# Taskr

> A self-hosted, production-grade background job processing platform — like a mini Trigger.dev or Inngest — that can run AI agent workflows.

## Core Engine (Node + Express + BullMQ + Redis)

- REST API to enqueue jobs — with priority, delay, cron scheduling
- Worker pool that pulls and executes jobs concurrently
- Retry with exponential backoff + dead letter queue
- Job status tracking in PostgreSQL (with full audit log)
- Real-time job status via WebSockets (SSE fallback)

## Multi-Tenancy Layer

- API key-based auth per tenant
- Per-tenant rate limiting (Redis-backed)
- Tenant isolation in PostgreSQL (Row-Level Security)

AI Agentic Layer (yahan tera differentiator hai)

- Ek job type: ai_agent_task — runs a RAG pipeline step or - tool-calling agent
- Multi-step agent workflows as chained jobs
- Output stored in MongoDB (because agent outputs are unstructured)

## Infra

- Terraform: EKS cluster, RDS PostgreSQL, ElastiCache Redis on AWS
- K8s manifests: Deployment, HPA (auto-scale workers on queue - depth), PodDisruptionBudget
- GitHub Actions CI/CD: test → build Docker image → push to ECR → deploy to K8s
- OpenTelemetry tracing + Prometheus metrics + Grafana dashboard

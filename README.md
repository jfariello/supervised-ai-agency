# Supervised AI Sales Agency

A human-in-the-loop AI agent workflow for sales and marketing operations.

This project explores how AI agents can research prospects, qualify opportunities, generate proposals, prepare outreach and schedule follow-ups while keeping consequential actions behind explicit human approval.

## Why this project exists

Many agent demos focus on full autonomy.

This project explores a different architecture:

> AI agents prepare and recommend actions. Humans remain in control of execution.

The goal is to combine useful automation with clear approval boundaries, observability and fallback behavior.

## Core workflow

~~~text
Prospect
   ↓
Research / Enrichment
   ↓
Lead Qualification
   ↓
Proposal Agent
   ↓
Email Draft
   ↓
Human Approval
   ↓
Send / Follow-up
   ↓
Audit Log
~~~

## Human-in-the-loop architecture

Actions that can affect real users are separated from the reasoning layer.

~~~text
Agent decision
      ↓
Pending approval
      ↓
Human review
      ↓
Approve / Reject
      ↓
Execution
~~~

This allows autonomous reasoning while keeping external side effects under human control.

## Features

- Lead ingestion from CSV, XLSX and Apify
- Website and email discovery
- Lead scoring and qualification
- AI-generated commercial proposals
- AI-generated outreach drafts
- Human approval queues
- Email delivery through Brevo
- Automated follow-up scheduling
- Agent execution history
- Integration status dashboard
- Demo mode with synthetic data

## Stack

- Next.js 15
- TypeScript
- React 19
- PostgreSQL
- Anthropic
- Apify
- Brevo
- Vercel Cron
- Zod

## Architecture

~~~mermaid
flowchart TD
    A[Lead Sources] --> B[Research Agent]
    B --> C[Qualification]
    C --> D[Proposal Agent]
    D --> E[Proposal and Email Draft]
    E --> F{Human Approval}
    F -->|Approved| G[External Action]
    F -->|Rejected| H[Revision]
    H --> D
    G --> I[Brevo / Follow-up]
    B --> J[Audit Log]
    D --> J
    G --> J
~~~

## AI layer

Anthropic models are currently used for proposal and outreach generation.

The AI provider is isolated from the rest of the workflow so the decision layer can be replaced or extended with other models.

When AI credentials are unavailable, parts of the application can operate with deterministic demo behavior.

## Configuration

Copy the example environment file:

~~~bash
cp .env.example .env.local
~~~

Main integrations:

~~~env
DATABASE_URL=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=

APIFY_TOKEN=
APIFY_DEFAULT_ACTOR_ID=

BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=

CRON_SECRET=
~~~

No production API credentials are included in this repository.

## Local development

Install dependencies:

~~~bash
pnpm install
~~~

Run the database migration when using PostgreSQL:

~~~bash
pnpm run db:migrate
~~~

Start the development server:

~~~bash
pnpm dev
~~~

Open:

~~~text
http://localhost:3000
~~~

## Demo mode

The repository contains synthetic leads and `.example` email addresses for testing.

No customer database, production credentials or private certificates are included.

## Security principles

- Secrets are provided through environment variables
- `.env` files are excluded from Git
- Private keys and certificates are excluded from Git
- Cron endpoints fail closed without authentication
- External email actions require authentication and human approval
- Demo data is synthetic
- Agent activity is recorded for inspection

## Where fast decision models fit

An interesting part of this architecture is the layer between **observation and action**.

Many agent steps do not require long-form generation. They require fast decisions such as:

~~~text
continue / retry / stop
approve / escalate
route to agent A / agent B
browser action A / browser action B
high confidence / human review
~~~

A low-latency model can be especially useful in this part of an agent workflow.

### Planned Jev experiment

I am interested in testing TypeSafe/Jev as a low-latency decision layer for:

- browser automation
- action routing
- retry decisions
- confidence thresholds
- human escalation
- multi-agent coordination

Jev is **not currently integrated into this repository**. It is a planned experiment for the decision layer.

## Validation

The project has been validated with:

~~~bash
pnpm run typecheck
pnpm run build
~~~

Both complete successfully.

## Status

Experimental project for exploring supervised AI agent architectures.

It is not intended to be a production-ready CRM or fully autonomous sales platform.

## Author

**Jorge Fariello**

AI automation, growth and digital systems.

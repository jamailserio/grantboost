# GrantBoost — Technical Specification

## Overview

GrantBoost is a **Next.js 14** web application that helps users draft grant proposals with AI. The primary UI is a **split-screen layout**: a structured input / chat panel on one side and a live grant document preview on the other.

## Goals

- Generate clear, funder-ready grant drafts from user context (organization, project, budget, outcomes).
- Stream AI responses into the document preview in real time.
- Keep the experience fast, accessible, and deployable on Vercel.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| AI | Vercel AI SDK (`ai`, provider SDKs as needed) |
| Language | TypeScript |
| Hosting | Vercel |
| Secrets | Environment variables only (never hardcoded) |

## Architecture

```
app/
  layout.tsx          # Root layout, fonts, global styles
  page.tsx            # Split-screen shell
  api/
    chat/route.ts     # Streaming AI endpoint (Vercel AI SDK)
components/
  GrantForm.tsx       # Left: inputs / prompts
  GrantPreview.tsx    # Right: live document
  SplitScreen.tsx     # Responsive two-pane layout
lib/
  prompts.ts          # System / grant prompt templates
  types.ts            # Shared TypeScript types
```

## UI: Split-Screen Layout

### Desktop (≥ `md`)

- **Left pane (~40%)**: Project details form and/or chat with the AI assistant.
- **Right pane (~60%)**: Live grant draft preview (sections such as Summary, Need, Activities, Outcomes, Budget narrative).
- Panes share height; independent scroll within each pane.

### Mobile (`< md`)

- Stacked layout: form/chat first, preview below (or tab toggle between Input and Preview).
- Preserve the same data flow; no feature loss.

### Key interactions

1. User fills organization/project fields and optionally sends free-text instructions.
2. Client calls `/api/chat` (or generate) with context + messages.
3. AI streams tokens; preview updates progressively.
4. User can edit fields and regenerate sections or the full draft.

## Data Model (client)

```ts
type GrantContext = {
  organizationName: string;
  mission?: string;
  projectTitle: string;
  problemStatement: string;
  targetPopulation?: string;
  activities?: string;
  outcomes?: string;
  budgetOverview?: string;
  funderName?: string;
  amountRequested?: string;
  deadline?: string;
};

type GrantSection = {
  id: string;
  title: string;
  content: string;
};
```

## API

### `POST /api/chat`

- Uses Vercel AI SDK streaming helpers (e.g. `streamText` / `toDataStreamResponse`).
- Accepts: conversation messages + `GrantContext`.
- Returns: streamed text (and optionally structured section updates).
- Model/provider configured via env (e.g. `OPENAI_API_KEY`, `AI_MODEL`).
- Validate input; reject empty or oversized payloads.
- Never log or return API keys.

## Prompting

- System prompt defines tone: professional, concise, evidence-oriented, NGO/nonprofit appropriate.
- Inject `GrantContext` into the prompt; do not invent unverifiable facts—flag gaps instead.
- Prefer structured sections aligned with common foundation/government RFPs.

## Non-Functional Requirements

- **Security**: Secrets only in `.env.local` / Vercel env; no keys in source, client bundles, or commits.
- **Performance**: Stream responses; keep initial JS lean; Tailwind for styling.
- **A11y**: Keyboard-navigable panes, labeled form controls, sufficient contrast.
- **Error handling**: Friendly UI errors for rate limits, missing keys, and network failures.

## Out of Scope (v1)

- User accounts / multi-tenant persistence
- PDF export (may be added later)
- Payment / billing
- Multi-language UI

## Success Criteria

- Split-screen works on desktop and degrades cleanly on mobile.
- End-to-end: fill form → stream draft → see sections in the preview.
- Stack remains Next.js 14 + Tailwind CSS + Vercel AI SDK with no hardcoded secrets.

# Technical Specification: grantboost

## 1. System Architecture Overview
The application is a single-page web app built with Next.js 14 and Tailwind CSS. It communicates directly with the Vercel AI SDK to stream OpenAI/Claude prompt outputs and uses Supabase for a simple backend database.

## 2. Page Components & Layout
The interface is a clean, modern dual-panel view using Tailwind CSS layouts:
- **Left Panel (Inputs):**
  - Textarea box for pasting raw field notes.
  - Dropdown select menu for Donor Framework (USAID, Corporate, Individual).
  - A prominent "Generate Narrative" button.
- **Right Panel (Outputs):**
  - A dynamic text container that streams the AI response live.
  - A "Copy to Clipboard" utility button.

## 3. Data Flow & AI Orchestration
1. The user clicks "Generate Narrative".
2. The client fires a POST request to `/api/generate` carrying the note text and donor type.
3. The server-side route handles the API request, retrieves the AI API key from secure environment variables, and constructs a structured system prompt.
4. The system leverages the Vercel AI SDK to stream the response back to the client UI.
5. A record of the request is pushed to the Supabase backend.

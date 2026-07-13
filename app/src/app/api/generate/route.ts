import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 60;

const DONOR_FRAMEWORKS = ["USAID", "Corporate", "Individual"] as const;
type DonorFramework = (typeof DONOR_FRAMEWORKS)[number];

function isDonorFramework(value: unknown): value is DonorFramework {
  return (
    typeof value === "string" &&
    (DONOR_FRAMEWORKS as readonly string[]).includes(value)
  );
}

function buildSystemPrompt(donorFramework: DonorFramework): string {
  const frameworkGuidance: Record<DonorFramework, string> = {
    USAID:
      "Structure the narrative for USAID reporting conventions: clear results framework language, measurable outcomes, activity-to-result logic, gender and inclusion considerations where present in the notes, and precise, evidence-based claims without exaggeration.",
    Corporate:
      "Structure the narrative for corporate partnership reporting: concise impact storytelling, alignment with shared value and ESG themes, clear outcomes for communities and business-relevant social impact, and a professional tone suitable for CSR and foundation audiences.",
    Individual:
      "Structure the narrative for individual donor communications: warm but professional storytelling, human-centered impact, dignity-preserving beneficiary language, a clear sense of progress and need, and an inspiring close that remains factual and non-manipulative.",
  };

  return `You are GrantBoost, a professional narrative writing assistant for CARE USA and peer international NGOs.

Your sole purpose is to transform raw field notes into structured, donor-compliant prose. You are not a casual chatbot. Do not engage in small talk, role-play outside this mandate, or answer unrelated questions.

Core rules:
- Write in polished, professional NGO English suitable for formal donor submission.
- Preserve factual content from the field notes; do not invent statistics, locations, partner names, or outcomes.
- If the notes are incomplete, write carefully around gaps and note limitations briefly only when necessary for honesty.
- Use dignity-first language; avoid savior framing, sensationalism, or paternalistic tone.
- Organize output with clear section headings appropriate to the selected donor framework.
- Prefer concrete activities, outputs, and outcomes over vague claims.

Selected donor framework: ${donorFramework}
Framework-specific guidance: ${frameworkGuidance[donorFramework]}

Output only the finished donor narrative. Do not include meta commentary, preambles, or explanations about your process.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const donorFramework = body.donorFramework;

    if (!notes) {
      return Response.json(
        { error: "Field notes are required." },
        { status: 400 },
      );
    }

    if (!isDonorFramework(donorFramework)) {
      return Response.json(
        {
          error:
            "Donor framework must be one of: USAID, Corporate, Individual.",
        },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: buildSystemPrompt(donorFramework),
      prompt: `Transform the following raw field notes into structured ${donorFramework} donor-compliant prose:\n\n${notes}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generate route error:", error);
    return Response.json(
      { error: "Failed to generate narrative." },
      { status: 500 },
    );
  }
}

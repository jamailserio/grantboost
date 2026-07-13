"use client";

import { useState } from "react";

const DONOR_FRAMEWORKS = ["USAID", "Corporate", "Individual"] as const;

type DonorFramework = (typeof DONOR_FRAMEWORKS)[number];

export default function Home() {
  const [fieldNotes, setFieldNotes] = useState("");
  const [donorFramework, setDonorFramework] =
    useState<DonorFramework>("USAID");
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGenerate() {
    const notes = fieldNotes.trim();
    if (!notes || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedText("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, donorFramework }),
      });

      if (!response.ok) {
        let message = "Failed to generate narrative.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // Non-JSON error body
        }
        throw new Error(message);
      }

      if (!response.body) {
        throw new Error("No response stream received.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let narrative = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        narrative += decoder.decode(value, { stream: true });
        setGeneratedText(narrative);
      }

      narrative += decoder.decode();
      setGeneratedText(narrative);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate narrative.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gb-bg)] text-[var(--gb-ink)]">
      <header className="border-b border-[var(--gb-border)] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--gb-care-red)]">
              GrantBoost
            </h1>
            <span className="hidden text-sm text-[var(--gb-muted)] sm:inline">
              CARE International · Donor Narrative Studio
            </span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--gb-muted)]">
            Translating raw field insights into compelling impact stories.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 lg:flex-row lg:gap-0 lg:p-0">
        {/* Left panel — inputs */}
        <section className="flex w-full flex-col border-[var(--gb-border)] bg-white lg:w-[42%] lg:border-r lg:px-8 lg:py-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--gb-ink)]">
              Instructions
            </h2>
            <p className="mt-1 text-sm text-[var(--gb-muted)]">
            Type or paste your raw field observations below, then select a target donor framework to transform your notes into a structured, professionally toned draft.
            </p>
          </div>

          <label
            htmlFor="field-notes"
            className="mb-2 text-sm font-medium text-[var(--gb-ink)]"
          >
            Field notes
          </label>
          <textarea
            id="field-notes"
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder="Paste observation notes, beneficiary quotes, activity summaries, and outcomes from the field…"
            className="min-h-[280px] w-full flex-1 resize-y rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--gb-ink)] placeholder:text-[var(--gb-muted)] focus:border-[var(--gb-care-red)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-care-red)]/20"
          />

          <label
            htmlFor="donor-framework"
            className="mb-2 mt-5 text-sm font-medium text-[var(--gb-ink)]"
          >
            Donor framework
          </label>
          <select
            id="donor-framework"
            value={donorFramework}
            onChange={(e) =>
              setDonorFramework(e.target.value as DonorFramework)
            }
            className="w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-4 py-2.5 text-sm text-[var(--gb-ink)] focus:border-[var(--gb-care-red)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-care-red)]/20"
          >
            {DONOR_FRAMEWORKS.map((framework) => (
              <option key={framework} value={framework}>
                {framework}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!fieldNotes.trim() || isGenerating}
            className="mt-6 w-full rounded-lg bg-[var(--gb-care-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--gb-care-red-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-care-red)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generating…" : "Generate Narrative"}
          </button>

          {error ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        {/* Right panel — output */}
        <section className="flex w-full flex-1 flex-col bg-[var(--gb-surface)] lg:px-8 lg:py-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--gb-ink)]">
                Generated narrative
              </h2>
              <p className="mt-1 text-sm text-[var(--gb-muted)]">
                Donor-aligned text streams here once you generate.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedText || isGenerating}
              className="shrink-0 rounded-lg border border-[var(--gb-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--gb-ink)] transition hover:border-[var(--gb-care-red)] hover:text-[var(--gb-care-red)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-care-red)]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy to Clipboard"}
            </button>
          </div>

          <div className="min-h-[360px] flex-1 overflow-y-auto rounded-lg border border-[var(--gb-border)] bg-white p-6 shadow-sm">
            {generatedText ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--gb-ink)]">
                {generatedText}
                {isGenerating ? (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--gb-care-red)] align-middle" />
                ) : null}
              </p>
            ) : isGenerating ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <p className="text-sm text-[var(--gb-muted)]">
                  Generating donor narrative…
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <p className="max-w-sm text-sm text-[var(--gb-muted)]">
                  Your framed narrative will appear in this panel. Select a
                  donor framework, add field notes, then generate.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

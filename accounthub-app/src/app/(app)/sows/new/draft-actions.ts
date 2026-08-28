"use server";

import type Anthropic from "@anthropic-ai/sdk";
import { anthropicClient, DRAFTING_MODEL } from "@/lib/anthropic";
import type { SowDraft } from "@/lib/types";

const DRAFT_TOOL = {
  name: "draft_sow",
  description:
    "Return a drafted Statement of Work section for a healthcare imaging / teleradiology account management project.",
  input_schema: {
    type: "object" as const,
    properties: {
      projectTitle: {
        type: "string",
        description: "A short, specific project title, e.g. 'HL7 Interface — New Facility Onboarding'.",
      },
      workSummary: {
        type: "string",
        description:
          "2-4 sentences of professional SOW language describing the overall scope of work. Plain prose, no bullet points.",
      },
      workDetails: {
        type: "array",
        items: { type: "string" },
        description:
          "4-8 concrete, numbered-list-ready action items describing the technical/implementation work, most concrete first.",
      },
    },
    required: ["projectTitle", "workSummary", "workDetails"],
  },
};

const SYSTEM_PROMPT = `You write Statements of Work for Synthesis Health, a teleradiology / radiology account management company. Given a short, informal project summary from an account manager, draft professional SOW content: a project title, a work summary paragraph, and a list of concrete work detail line items (technical/implementation steps). Use precise, professional language appropriate for a legal SOW document. Do not invent specific contract terms, prices, or dates — focus on describing the technical and operational scope of work. Prefer terms like HL7 interface, DICOM, PACS, RIS, modality, ADT feed, structured reporting, when relevant to the summary given.`;

export async function draftSow(summary: string): Promise<SowDraft> {
  const trimmed = summary.trim();
  if (!trimmed) throw new Error("Give a short project summary first.");

  const anthropic = anthropicClient();
  const message = await anthropic.messages.create({
    model: DRAFTING_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [DRAFT_TOOL],
    tool_choice: { type: "tool", name: "draft_sow" },
    messages: [
      {
        role: "user",
        content: `Project summary: ${trimmed}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) throw new Error("Claude didn't return a draft — try again.");

  const input = toolUse.input as Partial<SowDraft>;
  return {
    projectTitle: input.projectTitle?.trim() || "",
    workSummary: input.workSummary?.trim() || "",
    workDetails: (input.workDetails || []).map((d) => d.trim()).filter(Boolean),
  };
}

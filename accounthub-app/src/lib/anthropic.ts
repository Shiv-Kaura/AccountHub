import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function anthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it as an environment variable (Vercel: Settings → Environment Variables; locally: .env.local) to enable AI drafting."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// The model AccountHub itself is currently built with — used here too so SOW drafts come from
// the same model quality. If Anthropic ships a newer default, bump this string.
export const DRAFTING_MODEL = "claude-sonnet-5";

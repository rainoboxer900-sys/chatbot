import OpenAI from "openai";

import type { ChatMessage, ChatProvider } from "./types";

const HAIMAKER_BASE_URL = "https://api.haimaker.ai/v1";

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

export function createHaimakerProvider(): ChatProvider {
  const apiKey = process.env.HAIMAKER_API_KEY;
  const model = process.env.HAIMAKER_MODEL ?? "haimaker/auto";

  if (!apiKey || apiKey === "your_rotated_haimaker_key") {
    throw new ProviderConfigurationError(
      "HAIMAKER_API_KEY is not configured. Add a rotated key to .env.local.",
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: HAIMAKER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_SITE_NAME ?? "AI Chat",
    },
  });

  return {
    async generateReply(messages: ChatMessage[]) {
      const completion = await client.chat.completions.create({
        model,
        messages,
      });

      const reply = completion.choices[0]?.message?.content;

      if (!reply || typeof reply !== "string") {
        throw new Error("The provider returned an empty response.");
      }

      return reply;
    },
  };
}
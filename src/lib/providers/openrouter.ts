import OpenAI from "openai";

import type { ChatMessage, ChatProvider } from "./types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

export function createOpenRouterProvider(): ChatProvider {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || apiKey === "your_rotated_openrouter_key") {
    throw new ProviderConfigurationError(
      "OPENROUTER_API_KEY is not configured. Add a rotated key to .env.local.",
    );
  }

  if (!model || model === "your_openrouter_model_slug") {
    throw new ProviderConfigurationError(
      "OPENROUTER_MODEL is not configured. Add a model slug to .env.local.",
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
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

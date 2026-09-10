import type { ChatMessage, ChatProvider } from "./types";
import { DEFAULT_GOOGLE_MODEL } from "./models";

const GOOGLE_GENERATIVE_LANGUAGE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const RESPONSE_STYLE_INSTRUCTION =
  "Format answers with clean Markdown. For code, always use fenced code blocks with the language name and preserve proper indentation and line breaks; never compress a complete program into one line.";

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

export function createGoogleProvider(): ChatProvider {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const configuredModel = process.env.GOOGLE_AI_MODEL ?? DEFAULT_GOOGLE_MODEL;

  if (!apiKey || apiKey === "your_google_ai_studio_key") {
    throw new ProviderConfigurationError(
      "GOOGLE_AI_API_KEY is not configured. Add a Google AI Studio key to .env.local.",
    );
  }

  return {
    async generateReply(messages: ChatMessage[], requestedModel) {
      const systemMessages = messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .join("\n\n");
      const contents = messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        }));

      const instruction = [RESPONSE_STYLE_INSTRUCTION, systemMessages].filter(Boolean).join("\n\n");
      const modelName = requestedModel ?? configuredModel;
      const response = await fetch(
        `${GOOGLE_GENERATIVE_LANGUAGE_URL}/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: instruction }] },
            contents,
          }),
        },
      );
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        const error = new Error(data.error?.message ?? "Google AI request failed.");
        Object.assign(error, { status: response.status });
        throw error;
      }

      const reply = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("");

      if (!reply || typeof reply !== "string") {
        throw new Error("The provider returned an empty response.");
      }

      return reply;
    },
  };
}
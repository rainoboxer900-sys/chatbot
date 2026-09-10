import { createGoogleProvider, ProviderConfigurationError } from "@/lib/providers/google";
import { isGoogleModel } from "@/lib/providers/models";
import type { ChatMessage, ChatRole } from "@/lib/providers/types";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_TOTAL_LENGTH = 50_000;
const CHAT_ROLES: ChatRole[] = ["system", "user", "assistant"];

type ChatRequestBody = {
  messages?: unknown;
  model?: unknown;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    typeof message.role === "string" &&
    CHAT_ROLES.includes(message.role as ChatRole) &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

function invalidRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return invalidRequest("Request body must be valid JSON.");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return invalidRequest("At least one message is required.");
  }

  if (body.messages.length > MAX_MESSAGES) {
    return invalidRequest(`A maximum of ${MAX_MESSAGES} messages is allowed.`);
  }

  if (!body.messages.every(isChatMessage)) {
    return invalidRequest("Each message must include a valid role and content.");
  }

  const messages = body.messages as ChatMessage[];

  if (body.model !== undefined && !isGoogleModel(body.model)) {
    return invalidRequest("That model is not available. Choose a model from the selector.");
  }

  const totalLength = messages.reduce((total, message) => total + message.content.length, 0);

  if (totalLength > MAX_TOTAL_LENGTH) {
    return invalidRequest("The conversation is too large. Start a new chat and try again.");
  }

  try {
    const provider = createGoogleProvider();
    const reply = await provider.generateReply(messages, body.model as string | undefined);

    return Response.json({ reply });
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      console.error("Provider configuration error:", error.message);
      return Response.json(
        { error: "The AI provider is not configured. Check the server environment." },
        { status: 500 },
      );
    }

    console.error("Chat provider error:", error);
    return Response.json(
      { error: "The AI service could not generate a response. Please try again." },
      { status: 502 },
    );
  }
}

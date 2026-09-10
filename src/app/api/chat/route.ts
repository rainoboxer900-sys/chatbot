import { createGoogleProvider, ProviderConfigurationError } from "@/lib/providers/google";
import { isGoogleModel } from "@/lib/providers/models";
import { getStore } from "@netlify/blobs";
import { getAuth0, isAuth0Configured } from "@/lib/auth0";
import type { ChatAttachment } from "@/lib/providers/types";
import type { ChatMessage, ChatRole } from "@/lib/providers/types";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_TOTAL_LENGTH = 50_000;
const CHAT_ROLES: ChatRole[] = ["system", "user", "assistant"];

type ChatRequestBody = {
  messages?: unknown;
  model?: unknown;
  attachments?: unknown;
};

type UploadedAttachment = { key: string; name: string; mimeType: string };

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

function isUploadedAttachment(value: unknown): value is UploadedAttachment {
  if (!value || typeof value !== "object") return false;
  const attachment = value as Record<string, unknown>;
  return typeof attachment.key === "string" && typeof attachment.name === "string" && typeof attachment.mimeType === "string";
}

function isProviderAuthenticationError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: unknown }).status === 401,
  );
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

  let attachments: ChatAttachment[] = [];
  if (body.attachments !== undefined) {
    if (!Array.isArray(body.attachments) || body.attachments.length > 5 || !body.attachments.every(isUploadedAttachment)) {
      return invalidRequest("Attachments are invalid.");
    }

    if (!isAuth0Configured()) {
      return Response.json({ error: "Sign-in is required to use uploaded files." }, { status: 401 });
    }

    const userId = (await getAuth0().getSession())?.user?.sub;
    if (!userId) {
      return Response.json({ error: "Sign-in is required to use uploaded files." }, { status: 401 });
    }

    const userMarker = `/${encodeURIComponent(userId)}/`;
    const store = getStore("alvionbot-uploads");
    const loadedAttachments = await Promise.all(
      (body.attachments as UploadedAttachment[]).map(async (attachment) => {
        if (!attachment.key.includes(userMarker)) {
          throw new Error("Attachment ownership check failed.");
        }
        const blob = await store.get(attachment.key, { type: "arrayBuffer" });
        if (!blob) throw new Error("Uploaded file was not found.");
        return {
          name: attachment.name,
          mimeType: attachment.mimeType,
          data: Buffer.from(blob as ArrayBuffer).toString("base64"),
        };
      }),
    );
    attachments = loadedAttachments;
  }

  try {
    const provider = createGoogleProvider();
    const reply = await provider.generateReply(messages, body.model as string | undefined, attachments);

    return Response.json({ reply });
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      console.error("Provider configuration error:", error.message);
      return Response.json(
        { error: "The AI provider is not configured. Check the server environment." },
        { status: 500 },
      );
    }

    if (isProviderAuthenticationError(error)) {
      console.error("Google AI authentication error:", error);
      return Response.json(
        { error: "Google rejected the API key. Check the Netlify production key and its API restrictions." },
        { status: 502 },
      );
    }

    console.error("Chat provider error:", error);
    return Response.json(
      { error: "The AI service could not generate a response. Please try again." },
      { status: 502 },
    );
  }
}

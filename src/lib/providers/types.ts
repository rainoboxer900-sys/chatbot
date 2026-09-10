export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatAttachment = {
  name: string;
  mimeType: string;
  data: string;
};

export interface ChatProvider {
  generateReply(messages: ChatMessage[], model?: string, attachments?: ChatAttachment[]): Promise<string>;
}
